// controllers/authController.js
import User from "@/src/server/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "@/src/server/config/dbConnect";
// Sign Up
export async function signup(req) {
  try {
    await dbConnect();
    const { name, email, phone, password } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();
    return NextResponse.json(
      { message: "User created successfully", newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error); // Log the error for better debugging
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Sign In
export async function signin(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 400 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    // Generate a token with user's ID, name, and email
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name, // Add user's name
        email: user.email // Add user's email
      },
      "FlashCard",
      {
        expiresIn: "3m"
      }
    );

    return NextResponse.json(
      { message: "Sign-in successful", token },
      { status: 200 }
    );
  } catch (error) {
    console.error(error); // Log the error for better debugging
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
