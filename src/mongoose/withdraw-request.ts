import mongoose from 'mongoose';
import { WithdrawRequestStatus } from 'src/common/models/enums/withdraw-request-status';

export const WithdrawRequestSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    status: { type: String, enum: Object.values(WithdrawRequestStatus) },
  },
  { timestamps: true },
);

export interface WithdrawRequest {
  amount: number;
  store: mongoose.Schema.Types.ObjectId;
  status: string;
}
