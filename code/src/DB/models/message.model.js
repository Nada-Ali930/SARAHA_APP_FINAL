import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 10000,
      required: function () {
        return !this.attachments?.length;
      },
    },
    attachments: { type: [String] },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    collection: "Route_Messages",
    timestamps: true,
    autoIndex: true,
    validateBeforeSave: true,
    optimisticConcurrency: true,
  },
);

export const messageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)