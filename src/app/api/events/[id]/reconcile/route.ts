import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { s3, BUCKET } from "@/lib/s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ err: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        // 1. Verify ownership and get event code
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
            .select("id, owner_id, code")
            .eq("id", id)
            .single();

        if (!event) {
            return NextResponse.json({ err: "Event not found" }, { status: 404 });
        }

        if (event.owner_id !== user.id) {
            return NextResponse.json({ err: "Forbidden" }, { status: 403 });
        }

        // 2. Scan MinIO for ground truth
        const prefix = `${event.code}/`;
        let totalCount = 0;
        let totalSizeBytes = 0;
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;

        while (isTruncated) {
            const listRes: any = await s3.send(new ListObjectsV2Command({
                Bucket: BUCKET,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            }));

            if (listRes.Contents) {
                const validPhotos = listRes.Contents.filter((obj: any) =>
                    obj.Key &&
                    !obj.Key.includes("/.system/") &&
                    obj.Key !== prefix
                );

                totalCount += validPhotos.length;
                totalSizeBytes += validPhotos.reduce((acc: number, obj: any) => acc + (obj.Size || 0), 0);
            }

            isTruncated = listRes.IsTruncated || false;
            continuationToken = listRes.NextContinuationToken;
        }

        const totalSizeMB = totalSizeBytes / (1024 * 1024);

        // 3. Update Supabase with the ground truth
        const { error: updateError } = await supabase
            .from("events")
            .update({
                photo_count: totalCount,
                total_size_mb: totalSizeMB
            })
            .eq("id", id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            photo_count: totalCount,
            total_size_mb: totalSizeMB
        });

    } catch (error: any) {
        console.error("Reconciliation failed:", error);
        return NextResponse.json({
            success: false,
            err: error.message || "Failed to reconcile storage."
        }, { status: 500 });
    }
}
