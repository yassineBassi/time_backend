import mongoose from 'mongoose';

export const GiftCardSchema = new mongoose.Schema(
  {
    label: { type: String, default: '' },
    picture: { type: String, default: 'public/images/gift.png' },
    price: { type: Number },
    validityMills: { type: Number },
  },
  { timestamps: true },
);

export interface GiftCard {
  label: string;
  price: number;
  validityMills: number;
}
