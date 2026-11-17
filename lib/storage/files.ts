import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/*
 * Private product files in any S3-compatible bucket. Currently Backblaze B2;
 * Cloudflare R2 works by changing only the STORAGE_* settings (.env.example).
 * The bucket is private: files are reached only through links signed here,
 * after the server has checked who is asking. Download links last 60 seconds.
 */
export const DOWNLOAD_LINK_SECONDS = 60;
const UPLOAD_LINK_SECONDS = 5 * 60;
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

/** File types the owner may upload (extension → MIME type). */
export const allowedUploadTypes: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  zip: "application/zip",
  md: "text/markdown",
  txt: "text/plain",
  csv: "text/csv",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  stl: "model/stl",
  "3mf": "model/3mf",
  fig: "application/octet-stream",
};

export function isStorageConfigured() {
  const e = process.env;
  return Boolean(
    e.R2_ACCOUNT_ID && e.R2_ACCESS_KEY_ID && e.R2_SECRET_ACCESS_KEY && e.R2_BUCKET_PRIVATE,
  );
}

let client: S3Client | undefined;
function storage() {
  if (!isStorageConfigured()) throw new Error("File storage is not configured.");
  client ??= new S3Client({
    region: process.env.STORAGE_REGION || "auto",
    endpoint: process.env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    // B2 and R2 don't accept the SDK's newer default checksum headers on signed links.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
}
const bucket = () => process.env.STORAGE_BUCKET!;

export function downloadUrl(key: string, fileName: string | null) {
  const safeName = (fileName ?? key.split("/").pop() ?? "download").replace(/[^\w.\- ]/g, "_");
  return getSignedUrl(
    storage(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }),
    { expiresIn: DOWNLOAD_LINK_SECONDS },
  );
}

export function uploadUrl(key: string, contentType: string, size: number) {
  return getSignedUrl(
    storage(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    { expiresIn: UPLOAD_LINK_SECONDS },
  );
}

/** Size of an uploaded object, or null if it isn't there. */
export async function objectSize(key: string) {
  try {
    const head = await storage().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return head.ContentLength ?? null;
  } catch {
    return null;
  }
}
