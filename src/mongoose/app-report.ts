import mongoose from 'mongoose';
import { UserType } from 'src/common/models/enums/user-type';

export const AppReportSchema = new mongoose.Schema(
  {
    message: { type: String },
    creatorType: { type: String, enum: Object.values(UserType) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'creatorType' },
  },
  { timestamps: true },
);

export interface AppReport {
  message: string;
  creatorType: string;
  createdBy: mongoose.Schema.Types.ObjectId;
}
