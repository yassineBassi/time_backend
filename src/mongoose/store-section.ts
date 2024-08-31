import mongoose from "mongoose" ;

export const StoreSectionSchema = new mongoose.Schema({
    name: { type: String, unique: true },
}, {timestamps: true});

export interface StoreSection {
    storeName: String,
}
