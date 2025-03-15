import mongoose from 'mongoose';

export const FAQSchema = new mongoose.Schema(
  {
    question: { type: String },
    answer: { type: String },
  },
  { timestamps: true },
);

export interface FAQ {
  question: string;
  answer: string;
}
