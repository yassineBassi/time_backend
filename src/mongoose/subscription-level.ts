import mongoose from "mongoose" ;

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
    specialServices: { type: Boolean, default: false }
});

export interface SubscriptionLevel {
    title: String,
    color: String,
    price: Number,
    showPrice: Number,
    expirationDays: Number,
    reservations: Number,
    verified: Boolean,
    specialAds: Number,
    support: Boolean,
    specialServices: Boolean
}

