import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import multer, { memoryStorage } from "multer";
import { getUserPresignedUrls, uploadToS3 } from "./s3.mjs";

const app = express();
const PORT = process.env.PORT || 4000;

const storage = memoryStorage();
const upload = multer({ storage });

app.use(
  cors({
    origin: "*",
  })
);
app.use(json());

// Log server start
console.log(`Starting server on port ${PORT}`);

// POST /images - Upload a file to S3
app.post("/images", upload.single("image"), async (req, res) => {
  console.log("Received POST request to /images");  // Log request

  const { file } = req;
  const userId = req.headers["x-user-id"];

  console.log("File received:", file);  // Log file details
  console.log("User ID:", userId);       // Log user ID

  if (!file || !userId) {
    console.log("Bad request: Missing file or user ID");
    return res.status(400).json({ message: "Bad request" });
  }

  // Attempt to upload to S3
  try {
    const { error, key } = await uploadToS3({ file, userId });  // Add await here
    if (error) {
      console.log("Error during S3 upload:", error.message);
      return res.status(500).json({ message: error.message });
    }

    console.log("File successfully uploaded to S3 with key:", key);
    return res.status(201).json({ key });
  } catch (err) {
    console.log("Unexpected error during upload:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /images - Retrieve presigned URLs for user images
app.get("/images", async (req, res) => {
  console.log("Received GET request to /images");  // Log request

  const userId = req.headers["x-user-id"];
  console.log("User ID:", userId); // Log user ID

  if (!userId) {
    console.log("Bad request: Missing user ID");
    return res.status(400).json({ message: "Bad request" });
  }

  try {
    const { error, presignedUrls } = await getUserPresignedUrls(userId);
    if (error) {
      console.log("Error generating presigned URLs:", error.message);
      return res.status(400).json({ message: error.message });
    }

    console.log("Presigned URLs generated:", presignedUrls);
    return res.json(presignedUrls);
  } catch (err) {
    console.log("Unexpected error generating presigned URLs:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
