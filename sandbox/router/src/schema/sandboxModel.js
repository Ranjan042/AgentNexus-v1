import mongoose from 'mongoose';

const SandboxSchema = new mongoose.Schema(
  {
    sandboxId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      lowercase: true,
    },
    name: {
      type: String,
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'terminated'],
      default: 'running',
    },
    previewUrl: {
      type: String,
    },
    podName: {
      type: String,
    },
    serviceName: {
      type: String,
    },
    lastAccessedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

SandboxSchema.methods.isOwnedBy = function (userId) {
  if (!userId) return false;
  return this.userId.toString() === userId.toString();
};

const SandboxModel =
  mongoose.models.Sandbox || mongoose.model('Sandbox', SandboxSchema, 'sandboxes');

export default SandboxModel;
