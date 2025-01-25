import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const StoreSchema = new mongoose.Schema(
  {
    storeName: { type: String },
    //photos: { type: String },
    commerceNumber: { type: String },
    commerceNumberExpirationDate: { type: Date },
    accountNumber: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' },
    isVerified: { type: Boolean, default: false },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreSubscription',
    },
    workingTimes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkingTime',
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreReview' }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreReport' }],
    available: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

StoreSchema.add(UserSchema.obj);

export interface Store extends User {
  storeName: string;
  //photos: String,
  commerceNumber: string;
  commerceNumberExpirationDate: string;
  accountNumber: string;
  category: mongoose.Schema.Types.ObjectId;
  reviews: mongoose.Schema.Types.ObjectId[];
  reviewsCount: string;
  isVerified: string;
  subscription: mongoose.Schema.Types.ObjectId;
  workingTimes: mongoose.Schema.Types.ObjectId;
  services: mongoose.Schema.Types.ObjectId[];
  reports: mongoose.Schema.Types.ObjectId[];
  available: boolean;
}

StoreSchema.virtual('lat').get(function (this: Store) {
  return this.geoLocation.coordinates ? this.geoLocation.coordinates[1] : 0;
});

StoreSchema.virtual('lng').get(function (this: Store) {
  return this.geoLocation.coordinates ? this.geoLocation.coordinates[0] : 0;
});
