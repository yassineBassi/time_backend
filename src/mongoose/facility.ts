import mongoose from 'mongoose';

export const FacilitySchema = new mongoose.Schema(
  {
    title: { type: String },
    icon: { type: String },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FacilityItem' }],
  },
  { timestamps: true },
);

export interface Facility {
  title: string;
  icon: string;
  items: mongoose.Schema.Types.ObjectId[];
}
