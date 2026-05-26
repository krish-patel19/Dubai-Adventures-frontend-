import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust based on your auth config location
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();
        if (!name || name.trim().length < 2) {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }

        await connectToDatabase();
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { name: name.trim() } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Identity updated successfully",
            user: { name: updatedUser.name, email: updatedUser.email }
        });
    } catch (error) {
        console.error("User Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
