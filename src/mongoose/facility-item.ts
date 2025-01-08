import mongoose from 'mongoose';

export const FacilityItemSchema = new mongoose.Schema(
  {
    title: { type: String },
  },
  { timestamps: true },
);

export interface FacilityItem {
  title: string;
}
