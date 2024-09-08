import mongoose from "mongoose" ;
import { User, UserSchema } from './user' ;


export const StoreSchema = new mongoose.Schema({
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
    available: { type: Boolean, default: false }
});

StoreSchema.add(UserSchema.obj);

export interface Store extends User {
    storeName: String,
    //photos: String,
    commerceNumber: String,
    commerceNumberExpirationDate: String,
    accountNumber: String,
    category: mongoose.Schema.Types.ObjectId,
    reviews: String,
    reviewsCount: String,
    isVerified: String,
    //services: String,
    //comments: String,
    available: String
}

