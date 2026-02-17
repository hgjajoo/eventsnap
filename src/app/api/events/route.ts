import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connect } from "@/db/dbConfig";
import Event from "@/models/event.model";
import User from "@/models/user.model";
import { createEventSchema } from "@/lib/validations";

// GET — List organizer's events
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        await connect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        const events = await Event.find({ owner: user._id })
            .sort({ createdAt: -1 })
            .populate("attendeesAccessed", "name email");

        return NextResponse.json({ events, success: true });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// POST — Create a new event
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = createEventSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        await connect();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        // Generate unique event code
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        let codeExists = true;
        while (codeExists) {
            code = "";
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const existing = await Event.findOne({ code });
            codeExists = !!existing;
        }

        const event = await Event.create({
            name: validation.data.name,
            description: validation.data.description || "",
            date: validation.data.date ? new Date(validation.data.date) : undefined,
            code,
            owner: user._id,
            status: "active",
        });

        // Add event to user's events array
        user.events.push(event._id);
        await user.save();

        return NextResponse.json(
            { event, success: true, msg: "Event created successfully" },
            { status: 201 }
        );
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
