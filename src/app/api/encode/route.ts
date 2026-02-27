import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ err: "Missing eventId" }, { status: 400 });
        }

        // Verify event ownership
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        const { data: event } = await supabase
            .from("events")
            .select("id, code, owner_id")
            .eq("id", eventId)
            .eq("owner_id", user.id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found or unauthorized" }, { status: 404 });
        }

        // Proxy the call to the main_api server-side (no CORS issues)
        const MAIN_API_URL = process.env.NEXT_PUBLIC_MODEL_URL || "http://localhost:8000";
        const API_KEY = process.env.EVENTSNAP_API_KEY || "";

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (API_KEY) headers["X-API-Key"] = API_KEY;

        const encodeRes = await fetch(`${MAIN_API_URL}/api/events/encode-event/`, {
            method: "POST",
            headers,
            body: JSON.stringify({ minio_folder_path: event.code }),
        });

        const encodeData = await encodeRes.json();

        if (!encodeRes.ok) {
            return NextResponse.json(
                { err: encodeData.detail || "Failed to trigger encoding" },
                { status: encodeRes.status }
            );
        }

        return NextResponse.json({
            success: true,
            task_id: encodeData.task_id,
        });
    } catch (error: any) {
        console.error("Encode proxy error:", error);
        return NextResponse.json({ err: error.message }, { status: 500 });
    }
}
