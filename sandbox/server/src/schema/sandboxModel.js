import mongoose from 'mongoose';

/**
 * Sandbox Schema representing provisioned development environments owned by users.
 * Associates sandbox instance with the owning developer's userId from auth service.
 */
const SandboxSchema = new mongoose.Schema(
  {
    sandboxId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Development Sandbox',
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'terminated'],
      default: 'running',
      index: true,
    },
    previewUrl: {
      type: String,
      trim: true,
    },
    podName: {
      type: String,
      trim: true,
    },
    serviceName: {
      type: String,
      trim: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if a given userId owns this sandbox
SandboxSchema.methods.isOwnedBy = function (userId) {
  if (!userId) return false;
  return this.userId.toString() === userId.toString();
};

const SandboxModel =
  mongoose.models.Sandbox || mongoose.model('Sandbox', SandboxSchema, 'sandboxes');

export default SandboxModel;
