import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import { normalizeEmail, normalizeText } from "@/lib/normalizers";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        const normalizedName = typeof name === "string" ? normalizeText(name) : "";
        const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";
        const passwordValue = typeof password === "string" ? password : "";

        if (!normalizedName || !normalizedEmail || !passwordValue) {
            return NextResponse.json(
                { message: "Please fill out all fields" },
                { status: 400 }
            );
        }

        if (passwordValue.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(passwordValue, 10);

        await User.create({
            name: normalizedName,
            email: normalizedEmail,
            password: hashedPassword,
        });

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
