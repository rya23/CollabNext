import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";

// Helper function to parse form data in App Router
async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const files: any[] = [];
  const fields: Record<string, any> = {};

  // Process each form field
  for (const [name, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file fields
      const tempFilePath = path.join(
        process.cwd(),
        "tmp",
        `${Date.now()}-${value.name}`
      );

      // Ensure tmp directory exists
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Write the file to disk
      const buffer = Buffer.from(await value.arrayBuffer());
      fs.writeFileSync(tempFilePath, buffer);

      files.push({
        fieldname: name,
        originalname: value.name,
        mimetype: value.type,
        size: value.size,
        path: tempFilePath,
        filepath: tempFilePath,
        originalFilename: value.name,
      });
    } else {
      // Handle non-file fields
      if (fields[name]) {
        if (!Array.isArray(fields[name])) {
          fields[name] = [fields[name]];
        }
        fields[name].push(value);
      } else {
        fields[name] = value;
      }
    }
  }

  return { fields, files };
}

export async function POST(req: NextRequest) {
  try {
    console.log("Starting slideshow creation process");

    // Parse the form data (files and fields)
    const { fields, files } = await parseFormData(req);
    console.log("Form data parsed, checking for images");

    // Group files by field name
    const filesByFieldName: Record<string, any[]> = {};
    for (const file of files) {
      if (!filesByFieldName[file.fieldname]) {
        filesByFieldName[file.fieldname] = [];
      }
      filesByFieldName[file.fieldname].push(file);
    }

    console.log("Files received:", Object.keys(filesByFieldName));

    // Get image files
    const imageFiles = filesByFieldName.images || [];
    console.log(`Found ${imageFiles.length} images in upload`);

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: "No images uploaded" },
        { status: 400 }
      );
    }

    // Create a unique ID for this slideshow
    const reelId = uuidv4();
    console.log(`Created slideshow ID: ${reelId}`);

    const publicDir = path.join(process.cwd(), "public");
    const slideshowsDir = path.join(publicDir, "slideshows");
    const slideshowDir = path.join(slideshowsDir, reelId);
    const audioDir = path.join(publicDir, "audio");

    // Ensure all directories exist
    [publicDir, slideshowsDir, slideshowDir, audioDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        console.log(`Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create default audio file if it doesn't exist
    const defaultAudioPath = path.join(audioDir, "default.mp3");
    if (!fs.existsSync(defaultAudioPath)) {
      console.log(`Creating default audio file at ${defaultAudioPath}`);
      // Create an empty audio file or copy a sample one
      fs.writeFileSync(defaultAudioPath, Buffer.from([0]));
    }

    // Save images to the slideshow directory
    console.log("Saving images to slideshow directory");
    const savedImages = await Promise.all(
      imageFiles.map(async (file, index) => {
        try {
          const extension = path.extname(file.originalname || ".jpg");
          const newPath = path.join(slideshowDir, `image-${index}${extension}`);
          console.log(`Copying ${file.path} to ${newPath}`);

          // Make sure source file exists
          if (!fs.existsSync(file.path)) {
            throw new Error(`Source file does not exist: ${file.path}`);
          }

          // Copy file to new location
          await fs.promises.copyFile(file.path, newPath);
          console.log(`Successfully copied to ${newPath}`);

          // Clean up temp file
          await fs.promises.unlink(file.path);
          console.log(`Deleted temp file ${file.path}`);

          return {
            url: `/slideshows/${reelId}/image-${index}${extension}`,
            filename: `image-${index}${extension}`,
          };
        } catch (error) {
          console.error(`Error processing image ${index}:`, error);
          throw error;
        }
      })
    );

    // Create slideshow config file
    console.log("Creating slideshow config file");
    const configFile = {
      images: savedImages,
      duration: parseInt(fields.duration?.toString() || "2000", 10),
      audio: "/audio/default.mp3",
      createdAt: new Date().toISOString(),
    };

    const configPath = path.join(slideshowDir, "config.json");
    console.log(`Writing config to ${configPath}`);
    await fs.promises.writeFile(
      configPath,
      JSON.stringify(configFile, null, 2)
    );

    // Generate the URL for the slideshow
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const slideshowUrl = `${baseUrl}/slideshow/${reelId}`;
    console.log(`Generated slideshow URL: ${slideshowUrl}`);

    // Return the URL
    console.log("Sending successful response");
    return NextResponse.json({ reelUrl: slideshowUrl });
  } catch (error) {
    console.error("Error creating slideshow:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create slideshow",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
