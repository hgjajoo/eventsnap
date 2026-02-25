import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { updateEventSchema } from "@/lib/validations";
import { s3, BUCKET } from "@/lib/s3";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

type RouteContext = { params: Promise<{ id: string }> };

// GET — Single event details
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        const { data: event, error } = await supabase
            .from("events")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }

        if (event.owner_id !== user.id) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        // Get attendees for this event
        const { data: attendeeRows } = await supabase
            .from("event_attendees")
            .select("attendee_id, downloaded, downloaded_at, attendees(id, name, email)")
            .eq("event_id", id);

        const attendeesAccessed = (attendeeRows || []).map((row: any) => ({
            _id: row.attendees?.id,
            name: row.attendees?.name,
            email: row.attendees?.email,
            downloaded: row.downloaded,
            downloadedAt: row.downloaded_at,
        }));

        return NextResponse.json({
            event: { ...event, attendeesAccessed },
            success: true,
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// PUT — Update event
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = updateEventSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { err: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        // Verify ownership
        const { data: event } = await supabase
            .from("events")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }
        if (event.owner_id !== user.id) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        const { data: updated, error } = await supabase
            .from("events")
            .update(validation.data)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            event: updated,
            success: true,
            msg: "Event updated successfully",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// PATCH — Partial update event (e.g., photo counts after S3 upload)
export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { photo_count, total_size_mb } = body;

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!user) {
            return NextResponse.json({ err: "User not found" }, { status: 404 });
        }

        const { data: event, error: lookupError } = await supabase
            .from("events")
            .select("id, photo_count, total_size_mb, owner_id")
            .eq("id", id)
            .single();

        if (lookupError || !event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }
        if (event.owner_id !== user.id) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        const newPhotoCount = (event.photo_count || 0) + (photo_count || 0);
        const newTotalSize = (event.total_size_mb || 0) + (total_size_mb || 0);

        const { error: updateError } = await supabase
            .from("events")
            .update({
                photo_count: newPhotoCount,
                total_size_mb: newTotalSize
            })
            .eq("id", id);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            photo_count: newPhotoCount,
            total_size_mb: newTotalSize
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}

// DELETE — Delete event
export async function DELETE(_request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

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
            .select("owner_id, code")
            .eq("id", id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }
        if (event.owner_id !== user.id) {
            return NextResponse.json({ err: "Not authorized" }, { status: 403 });
        }

        // ─── MinIO Cleanup ───
        // Delete all objects under the prefix: {code}/
        try {
            const prefix = `${event.code}/`;
            let isTruncated = true;
            let continuationToken: string | undefined = undefined;

            while (isTruncated) {
                const listRes: any = await s3.send(new ListObjectsV2Command({
                    Bucket: BUCKET,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                }));

                const objects = listRes.Contents;
                if (objects && objects.length > 0) {
                    await s3.send(new DeleteObjectsCommand({
                        Bucket: BUCKET,
                        Delete: {
                            Objects: objects.map((obj: any) => ({ Key: obj.Key })),
                            Quiet: true,
                        },
                    }));
                }

                isTruncated = !!listRes.IsTruncated;
                continuationToken = listRes.NextContinuationToken;
            }
        } catch (s3Err) {
            console.error("Failed to cleanup MinIO storage during event deletion:", s3Err);
            // We continue anyway so the DB row is deleted, but we log the leak
        }

        // CASCADE will handle event_attendees cleanup
        const { error } = await supabase
            .from("events")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            msg: "Event deleted successfully",
        });
    } catch (err: any) {
        return NextResponse.json({ err: err.message }, { status: 500 });
    }
}
