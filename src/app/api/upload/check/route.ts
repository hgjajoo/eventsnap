import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { s3, BUCKET, ensureBucketExists } from "@/lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { eventId, filenames } = body;

        if (!eventId || !filenames || !Array.isArray(filenames)) {
            return NextResponse.json({ err: "Missing eventId or valid filenames array" }, { status: 400 });
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
            .select("id, code")
            .eq("id", eventId)
            .eq("owner_id", user.id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found or unauthorized" }, { status: 404 });
        }

        await ensureBucketExists();

        // Query MinIO for objects under this event's folder
        const prefix = event.code.endsWith('/') ? event.code : `${event.code}/`;
        const existingFiles = new Set<string>();
        let totalMinioSizeMB = 0;

        try {
            let isTruncated = true;
            let continuationToken: string | undefined = undefined;

            while (isTruncated) {
                const command = new ListObjectsV2Command({
                    Bucket: BUCKET,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                });

                const response: any = await s3.send(command);

                if (response.Contents) {
                    for (const item of response.Contents) {
                        if (item.Key) {
                            // Extract basename: "eventcode/my_image.jpg" -> "my_image.jpg"
                            const basename = item.Key.substring(prefix.length);
                            if (basename.length > 0) {
                                existingFiles.add(basename);
                                if (item.Size) {
                                    totalMinioSizeMB += item.Size / (1024 * 1024);
                                }
                            }
                        }
                    }
                }

                isTruncated = response.IsTruncated || false;
                continuationToken = response.NextContinuationToken;
            }
        } catch (s3Error: any) {
            // If the folder doesn't exist yet, that's fine, return empty
            if (s3Error.name !== "NoSuchBucket") {
                console.error("S3 ListObjects Error:", s3Error);
            }
        }

        // --- SELF-HEAL DATABASE ---
        // We now have the exact ground truth of MinIO, so let's overwrite the DB to ensure perfect sync
        // in case previous uploads were interrupted.
        try {
            await supabase
                .from("events")
                .update({
                    photo_count: existingFiles.size,
                    total_size_mb: Number(totalMinioSizeMB.toFixed(2))
                })
                .eq("id", eventId);
        } catch (dbErr) {
            console.error("Failed to self-heal database:", dbErr);
        }

        // Check which requested filenames already exist
        const alreadyUploaded = filenames.filter(name => {
            const basename = name.split("/").pop() || name;
            return existingFiles.has(basename);
        });

        return NextResponse.json({
            success: true,
            existingFiles: alreadyUploaded,
            trueTotalCount: existingFiles.size
        });

    } catch (error) {
        console.error("Upload check error:", error);
        return NextResponse.json({ err: "Failed to check existing uploads" }, { status: 500 });
    }
}
