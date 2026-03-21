import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const accountId  = process.env.CLOUDFLARE_R2_ACCOUNT_ID || ''
const accessKey  = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
const secretKey  = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'sandnco-media'
const publicUrl  = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || ''

// Cloudflare R2 is S3-compatible
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
})

/**
 * Upload a Buffer or Uint8Array to R2.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await r2.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    // Make file publicly accessible (requires bucket to have public access enabled)
    ACL: undefined,
  }))

  return `${publicUrl}/${key}`
}
