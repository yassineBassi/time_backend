import mongoose from 'mongoose';

export const AdSchema = new mongoose.Schema(
  {
    image: { type: String },
    title: { type: String },
  },
  { timestamps: true },
);

export interface Ad {
  image: string;
  title: string,
}
