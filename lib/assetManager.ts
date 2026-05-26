import connectToDatabase from "./mongodb";
import Asset from "@/models/Asset";
import Booking from "@/models/Booking";
import Activity from "@/models/Activity";
import { addMinutes, parse, isWithinInterval, areIntervalsOverlapping } from "date-fns";

const BUFFER_MINUTES = 45;

/**
 * Parses a time slot string like "09:00 - 11:00" into a Date interval for a specific date.
 * Handles single times (e.g., "09:00") by assuming a 2-hour default duration.
 */
function parseTimeSlot(date: Date, timeSlot: string) {
    if (!timeSlot) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return { start: d, end: new Date(d.getTime() + 3600000) };
    }

    const parts = timeSlot.split(" - ").map(s => s.trim());
    const startStr = parts[0];
    const endStr = parts[1];
    
    const start = new Date(date);
    const [startH, startM] = (startStr || "00:00").split(":").map(Number);
    start.setHours(isNaN(startH) ? 0 : startH, isNaN(startM) ? 0 : startM, 0, 0);

    const end = new Date(date);
    if (endStr) {
        const [endH, endM] = endStr.split(":").map(Number);
        end.setHours(isNaN(endH) ? 0 : endH, isNaN(endM) ? 0 : endM, 0, 0);
        
        // Ensure end is after start (handles slots crossing midnight, though unlikely for activities)
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }
    } else {
        // Fallback: Default to 2 hours after start if only one time is provided
        end.setTime(start.getTime() + (2 * 60 * 60 * 1000));
    }

    return { start, end };
}

/**
 * Checks if two time intervals overlap, including a 45-minute buffer.
 */
export function isAssetInUse(requestedInterval: { start: Date, end: Date }, existingInterval: { start: Date, end: Date }) {
    const bufferedExisting = {
        start: addMinutes(existingInterval.start, -BUFFER_MINUTES),
        end: addMinutes(existingInterval.end, BUFFER_MINUTES)
    };
    
    return areIntervalsOverlapping(requestedInterval, bufferedExisting);
}

/**
 * Primary engine to calculate real-time asset availability.
 */
export async function getAssetAvailability(activityId: string, dateStr: string, timeSlot: string, excludeBookingId?: string) {
    await connectToDatabase();

    const activity = await Activity.findOne({ id: activityId });
    if (!activity) return 0;

    const requestedDate = new Date(dateStr);
    const requestedInterval = parseTimeSlot(requestedDate, timeSlot);

    // 1. Identify all Linked Assets (Individual or Pool)
    const assetIds = activity.linkedAssets || [];
    if (assetIds.length === 0) return activity.maxGroupSize; // Fallback to legacy logic

    // 2. Fetch Assets and Check Maintenance Status
    const assets = await Asset.find({ 
        $or: [
            { id: { $in: assetIds } },
            { poolId: { $in: assetIds } }
        ],
        status: { $ne: "Maintenance" }
    });

    if (assets.length === 0) return 0;

    let totalAvailableCapacity = 0;

    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    for (const asset of assets) {
        // Find existing bookings for this specific asset that overlap with buffer
        const existingBookings = await Booking.find({
            assignedAssetId: asset.id,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: "confirmed",
            ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        });

        let assetIsBlocked = false;
        let currentOccupancy = 0;

        for (const booking of existingBookings) {
            const bookingInterval = parseTimeSlot(booking.date, booking.timeSlot);
            
            if (isAssetInUse(requestedInterval, bookingInterval)) {
                // Determine if this booking blocks the entire asset
                // Fetch the activity of the existing booking to check its bookingType
                const bookingActivity = await Activity.findOne({ id: booking.activityId });
                if (bookingActivity?.bookingType === "Private") {
                    assetIsBlocked = true;
                    break;
                }
                currentOccupancy += (booking.adults + (booking.children || 0));
            }
        }

        if (assetIsBlocked) continue;

        // Apply Capacity Scaling for the requested activity
        const scaling = asset.activityScaling?.find((s: any) => s.activityType === activity.category);
        const maxCapacity = scaling ? scaling.capacity : asset.baseCapacity;

        totalAvailableCapacity += Math.max(0, maxCapacity - currentOccupancy);
    }

    return totalAvailableCapacity;
}

/**
 * Finds a specific available asset ID that can accommodate the requested slots.
 * Prioritizes individual assets, then pool units.
 */
export async function findAvailableAsset(activityId: string, dateStr: string, timeSlot: string, requestedSlots: number, excludeBookingId?: string) {
    await connectToDatabase();
    const activity = await Activity.findOne({ id: activityId });
    if (!activity) return null;

    const requestedDate = new Date(dateStr);
    const requestedInterval = parseTimeSlot(requestedDate, timeSlot);

    const assetIds = activity.linkedAssets || [];
    if (assetIds.length === 0) return null;

    const assets = await Asset.find({ 
        $or: [
            { id: { $in: assetIds } },
            { poolId: { $in: assetIds } }
        ],
        status: "Available" // Mandatory check for conflict resolution
    });

    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    for (const asset of assets) {
        const existingBookings = await Booking.find({
            assignedAssetId: asset.id,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: "confirmed",
            ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
        });

        let assetIsBlocked = false;
        let currentOccupancy = 0;

        for (const booking of existingBookings) {
            const bookingInterval = parseTimeSlot(booking.date, booking.timeSlot);
            if (isAssetInUse(requestedInterval, bookingInterval)) {
                const bookingActivity = await Activity.findOne({ id: booking.activityId });
                if (bookingActivity?.bookingType === "Private") {
                    assetIsBlocked = true;
                    break;
                }
                currentOccupancy += (booking.adults + (booking.children || 0));
            }
        }

        if (assetIsBlocked) continue;

        const scaling = asset.activityScaling?.find((s: any) => s.activityType === activity.category);
        const maxCapacity = scaling ? scaling.capacity : asset.baseCapacity;

        if (maxCapacity - currentOccupancy >= requestedSlots) {
            return asset.id;
        }
    }

    return null;
}
