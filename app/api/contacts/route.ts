import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();
        
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
        }

        const newContact = await Contact.create({
            name: body.name,
            email: body.email,
            phone: body.phone || "",
            subject: body.subject || "",
            message: body.message,
            status: "unread",
        });

        return NextResponse.json({ success: true, id: newContact._id }, { status: 201 });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 });
    }
}
