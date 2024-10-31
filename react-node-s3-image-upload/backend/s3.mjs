import {
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
  } from "@aws-sdk/client-s3";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { v4 as uuid } from "uuid";
  
  // Use environment variables for configuration
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
  });
  const BUCKET = process.env.BUCKET;
  
  export const uploadToS3 = async ({ file, userId }) => {
    const key = `${userId}/${uuid()}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
  
    try {
      console.log(`Uploading file to S3 with key: ${key}`);
      await s3.send(command);
      console.log(`File successfully uploaded with key: ${key}`);
      return { key };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return { error };
    }
  };
  
  const getImageKeysByUser = async (userId) => {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `${userId}/`,  // Ensure correct prefix structure
    });
  
    try {
      console.log(`Fetching images for user: ${userId}`);
      const { Contents = [] } = await s3.send(command);
      const keys = Contents.sort(
        (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
      ).map((image) => image.Key);
      console.log(`Found image keys for user ${userId}:`, keys);
      return keys;
    } catch (error) {
      console.error("Error fetching image keys from S3:", error);
      return [];
    }
  };
  
  export const getUserPresignedUrls = async (userId) => {
    try {
      const imageKeys = await getImageKeysByUser(userId);
  
      const presignedUrls = await Promise.all(
        imageKeys.map((key) => {
          const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
          return getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
        })
      );
  
      console.log(`Presigned URLs generated for user ${userId}:`, presignedUrls);
      return { presignedUrls };
    } catch (error) {
      console.error("Error generating presigned URLs:", error);
      return { error };
    }
  };
  