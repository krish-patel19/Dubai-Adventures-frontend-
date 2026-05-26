import connectToDatabase from "@/lib/mongodb";
import ActivityModule from "@/models/Activity";
import TourPackage from "@/models/TourPackage";
import SiteConfig from "@/models/SiteConfig";
import { EXPERIENCE_TEMPLATES, enrichActivity } from "@/lib/experience-templates";

export async function getActivitiesData() {
  await connectToDatabase();
  const activitiesRaw = await ActivityModule.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  let activities = Array.isArray(activitiesRaw) ? activitiesRaw : [];
  if (!activities.length) {
    activities = EXPERIENCE_TEMPLATES as any;
  }
  return JSON.parse(JSON.stringify(activities.map((a: any) => enrichActivity(a))));
}

export async function getPackagesData() {
  await connectToDatabase();
  const packagesRaw = await TourPackage.find({ status: "PUBLISHED" }).sort({ createdAt: -1 }).limit(50).lean();
  const packages = (packagesRaw as any[] || []).map((pkg: any) => ({
    ...pkg,
    id: pkg.id || pkg._id.toString(),
  }));
  return JSON.parse(JSON.stringify(packages));
}

export async function getSiteConfigData() {
  await connectToDatabase();
  const siteConfigRaw = await SiteConfig.findOne().lean();
  return siteConfigRaw ? JSON.parse(JSON.stringify(siteConfigRaw)) : null;
}
