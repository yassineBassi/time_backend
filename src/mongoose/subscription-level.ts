import mongoose from 'mongoose';

export const SubscriptionLevelSchema = new mongoose.Schema({
  title: { type: String },
  color: { type: String },
  price: { type: Number },
  showPrice: { type: Number },
  expirationDays: { type: Number },
  reservations: { type: Number },
  verified: { type: Boolean, default: false },
  specialAds: { type: Number },
  support: { type: Boolean, default: false },
  specialServices: { type: Boolean, default: false },
});

export interface SubscriptionLevel {
  title: string;
  color: string;
  price: number;
  showPrice: number;
  expirationDays: number;
  reservations: number;
  verified: boolean;
  specialAds: number;
  support: boolean;
  specialServices: boolean;
}
