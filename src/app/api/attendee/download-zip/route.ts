import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/attendee/download-zip — Trigger background zip generation
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Not authenticated" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ err: "eventId required" }, { status: 400 });
        }

        // Get cached photos
        const { data: access } = await supabase
            .from("event_attendees")
            .select("matched_photos")
            .eq("event_id", eventId)
            .eq("attendee_id", userId)
            .single();

        if (!access || !access.matched_photos || (access.matched_photos as any[]).length === 0) {
            return NextResponse.json({ err: "No photos found" }, { status: 404 });
        }

        const photos = access.matched_photos as { filename: string; path: string }[];

        // Call main_api to start background zipping
        const response = await fetch(`${process.env.NEXT_PUBLIC_MODEL_URL}/api/attendees/generate-zip/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.EVENTSNAP_API_KEY || ""
            },
            body: JSON.stringify({
                event_id: eventId,
                user_id: userId,
                image_paths: photos.map(p => ({ filename: p.filename, path: p.path }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to start ZIP generation");
        }

        // Increment download count on the event
        const { data: evt } = await supabase
            .from("events")
            .select("download_count")
            .eq("id", eventId)
            .single();

        if (evt) {
            await supabase
                .from("events")
                .update({ download_count: (evt.download_count || 0) + 1 })
                .eq("id", eventId);
        }

        return NextResponse.json({
            success: true,
            task_id: data.task_id,
            message: "Background ZIP generation started"
        });
    } catch (err: unknown) {
        console.error("ZIP trigger error:", err);
        const message = err instanceof Error ? err.message : "Failed to start download";
        return NextResponse.json({ err: message }, { status: 500 });
    }
}
