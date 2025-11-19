import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const comicRefSchema = new Schema(
  {
    volumeId: { type: String, required: true },
    title: String,
    coverUrl: String,
    publisher: String,
    year: String,
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
    },
    bio: { type: String, default: "" },
    favoriteHero: { type: String, default: "" },
    favoriteComic: { type: String, default: "" },
    avatarKey: { type: String, default: "" },
    favorites: [comicRefSchema],
    readLater: [comicRefSchema],
    alreadyRead: [comicRefSchema],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

export type ComicRef = InferSchemaType<typeof comicRefSchema>;
export type UserDocument = InferSchemaType<typeof userSchema>;

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export default User;
