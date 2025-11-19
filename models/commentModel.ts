import { Schema, models, model } from "mongoose";

const commentSchema = new Schema(
  {
    comicVolumeId: {
      type: String, // this should match String(comic.id) used in URLs
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String, // snapshot of username so populate isnt needed just to show it
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Comment = models.Comment || model("Comment", commentSchema);

export default Comment;
