import mongoose, { Schema } from 'mongoose';
import { IContact } from './contact.interface';

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for better query performance
contactSchema.index({ isRead: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

const Contact = mongoose.model<IContact>('Contact', contactSchema);
export default Contact;