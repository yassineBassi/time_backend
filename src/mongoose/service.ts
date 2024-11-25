import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const ServiceSchema = new mongoose.Schema({
  storeName: { type: String },
  //photos: { type: String },
  commerceNumber: { type: String },
  commerceNumberExpirationDate: { type: Date },
  accountNumber: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' },
  reviews: { type: Number },
  reviewsCount: { type: Number },
  isVerified: { type: Boolean, default: false },
  //services: { type: String },
  //comments: { type: String },
  available: { type: Boolean, default: false },
});

ServiceSchema.add(UserSchema.obj);

export interface Service extends User {
  storeName: string;
  //photos: String,
  commerceNumber: string;
  commerceNumberExpirationDate: string;
  accountNumber: string;
  category: mongoose.Schema.Types.ObjectId;
  reviews: string;
  reviewsCount: string;
  isVerified: string;
  //services: String,
  //comments: String,
  available: string;
}
