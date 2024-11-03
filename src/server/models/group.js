// src/server/models/Group.js
import mongoose from "mongoose";

const termSchema = new mongoose.Schema({
  term: {
    type: String,
    required: true
  },
  definition: {
    type: String,
    required: true
  },
  image: [
    {
      public_id: { type: String },
      url: { type: String }
    }
  ]
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  groupImage: {
    public_id: { type: String },
    url: { type: String }
  },
  terms: [termSchema], // Array of terms with definitions and optional images
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
