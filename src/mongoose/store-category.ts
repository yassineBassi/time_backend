import mongoose from 'mongoose';

export const StoreCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreSection' },
    visible: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export interface StoreCategory {
  name: string;
  section: mongoose.Schema.Types.ObjectId;
  visible: boolean;
}
