import mongoose from "mongoose" ;

export const StoreCategorySchema = new mongoose.Schema({
    name: { type: String, unique: true },
    section: {type: mongoose.Schema.Types.ObjectId, ref: "StoreSection"}
}, {timestamps: true});

export interface StoreCategory {
    storeName: String,
    section: mongoose.Schema.Types.ObjectId
}

