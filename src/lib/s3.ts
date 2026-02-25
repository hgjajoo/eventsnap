import { S3Client } from "@aws-sdk/client-s3";

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
