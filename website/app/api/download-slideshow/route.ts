import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

export async function GET(req: NextRequest) {
  try {
    // Get the slideshow ID from the query parameter
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing slideshow ID" },
        { status: 400 }
      );
    }

    // Path to the slideshow directory
    const slideshowDir = path.join(process.cwd(), "public", "slideshows", id);

    // Check if the directory exists
    if (!fs.existsSync(slideshowDir)) {
      return NextResponse.json(
        { error: "Slideshow not found" },
        { status: 404 }
      );
    }

    // Read the config file to get image information
    const configPath = path.join(slideshowDir, "config.json");
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: "Slideshow configuration not found" },
        { status: 404 }
      );
    }

    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    // Create a new zip file
    const zip = new JSZip();

    // Add each image to the zip
    for (const image of config.images) {
      const imagePath = path.join(slideshowDir, image.filename);
      if (fs.existsSync(imagePath)) {
        const imageContent = fs.readFileSync(imagePath);
        zip.file(image.filename, imageContent);
      }
    }

    // Add the audio file if it exists
    const audioPath = path.join(process.cwd(), "public", config.audio);
    if (fs.existsSync(audioPath)) {
      const audioContent = fs.readFileSync(audioPath);
      zip.file("audio.mp3", audioContent);
    }

    // Add the config file too
    zip.file("config.json", configContent);

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    // Set the response headers
    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename=slideshow-${id}.zip`
    );

    // Return the zip file
    return new NextResponse(zipContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to download slideshow",
      },
      { status: 500 }
    );
  }
}
