import mongoose from 'mongoose';

export const StoreSectionSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    icon: { type: String },
    language: { type: String, enum: ['en', 'fr', 'ar'] },
  },
  { timestamps: true },
);

export interface StoreSection {
  storeName: string;
  icon: string;
  language: string;
}
