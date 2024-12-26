import mongoose from 'mongoose';

export const FacilityItemSchema = new mongoose.Schema({
  title: { type: String },
});

export interface FacilityItem {
  title: string;
}
