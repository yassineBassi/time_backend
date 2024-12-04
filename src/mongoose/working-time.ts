import mongoose from 'mongoose';

export const WorkingTimeSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  monday: { type: [String] },
  tuesday: { type: [String] },
  wednesday: { type: [String] },
  thursday: { type: [String] },
  friday: { type: [String] },
  sunday: { type: [String] },
  saturday: { type: [String] },
});

export interface WorkingTime {
  storeId: mongoose.Schema.Types.ObjectId;
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  sunday: string[];
  saturday: string[];
}
