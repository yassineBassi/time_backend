import mongoose from 'mongoose';

export const WorkingTimeSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    monday: { type: [String], default: [] },
    tuesday: { type: [String], default: [] },
    wednesday: { type: [String], default: [] },
    thursday: { type: [String], default: [] },
    friday: { type: [String], default: [] },
    sunday: { type: [String], default: [] },
    saturday: { type: [String], default: [] },
  },
  { timestamps: true },
);

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
