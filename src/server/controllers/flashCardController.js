// src/server/controllers/groupController.js
import dbConnect from "@/src/server/config/dbConnect";
import Group from "@/src/server/models/group";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function createNew(req) {
  await dbConnect(); // Ensure a database connection

  try {
    const { name, description, groupImage, terms, userId } = await req.json();

    // Upload groupImage to Cloudinary
    let groupImageData = null;
    if (groupImage) {
      try {
        const uploadedGroupImage = await cloudinary.v2.uploader.upload(
          groupImage,
          {
            folder: "Flashcards",
            width: 500,
            crop: "scale"
          }
        );
        groupImageData = {
          public_id: uploadedGroupImage.public_id,
          url: uploadedGroupImage.secure_url
        };
      } catch (error) {
        return NextResponse.json(
          { message: "Failed to upload group image", error: error.message },
          { status: 500 }
        );
      }
    }

    // Upload term images to Cloudinary
    const termsWithImages = await Promise.all(
      terms.map(async (term) => {
        if (term.image) {
          try {
            const uploadedTermImage = await cloudinary.v2.uploader.upload(
              term.image,
              {
                folder: "Flashcards",
                width: 500,
                crop: "scale"
              }
            );
            return {
              ...term,
              image: {
                public_id: uploadedTermImage.public_id,
                url: uploadedTermImage.secure_url
              }
            };
          } catch (error) {
            throw new Error(`Failed to upload image for term "${term.term}"`);
          }
        }
        return term;
      })
    );

    // Create new group with Cloudinary images
    const newGroup = new Group({
      name,
      description,
      groupImage: groupImageData,
      terms: termsWithImages,
      user: userId
    });

    const savedGroup = await newGroup.save();

    return NextResponse.json(
      { message: "Group created successfully", group: savedGroup },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { message: "Error creating group", error: error.message },
      { status: 500 }
    );
  }
}

export async function getMyFlashCard(request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const groups = await Group.find({ user: userId }).populate("user");

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return NextResponse.json(
      { message: "Error fetching groups", error: error.message },
      { status: 500 }
    );
  }
}
