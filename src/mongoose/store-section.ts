import mongoose from 'mongoose';

export const StoreSectionSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    icon: { type: String },
    language: { type: String, enum: ['en', 'fr', 'ar'] },
    visible: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export interface StoreSection {
  name: string;
  icon: string;
  language: string;
  visible: boolean;
}
