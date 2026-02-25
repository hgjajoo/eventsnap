import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
} from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT!;
const accessKey = process.env.MINIO_ACCESS_KEY!;
const secretKey = process.env.MINIO_SECRET_KEY!;

export const BUCKET = process.env.MINIO_BUCKET_NAME!;

export const s3 = new S3Client({
    endpoint,
    region: "us-east-1", // MinIO doesn't care, but SDK requires it
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for MinIO
});

/** Ensure the bucket exists in MinIO; create it if missing */
let bucketChecked = false;
export async function ensureBucketExists() {
    if (bucketChecked) return;
    try {
        await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
        bucketChecked = true;
    } catch (err: unknown) {
        const code =
            (err as { name?: string }).name ||
            (err as { $metadata?: { httpStatusCode?: number } }).$metadata
                ?.httpStatusCode;
        if (code === "NotFound" || code === 404 || code === "NoSuchBucket") {
            console.log(`Bucket "${BUCKET}" not found — creating it...`);
            await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
            bucketChecked = true;
            console.log(`Bucket "${BUCKET}" created successfully.`);
        } else {
            throw err;
        }
    }
}
