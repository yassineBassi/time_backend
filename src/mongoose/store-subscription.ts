import mongoose from 'mongoose';
import { SubscriptionStatus } from 'src/common/models/enums/subscription-status';

export const StoreSubscriptionSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionLevel',
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TapPayment' },
  },
  { timestamps: true },
);

export interface StoreSubscription {
  storeId: mongoose.Schema.Types.ObjectId;
  subscriptionId: mongoose.Schema.Types.ObjectId;
  paymentId: mongoose.Schema.Types.ObjectId;
  subscription: mongoose.Schema.Types.ObjectId;
  status: SubscriptionStatus;
  createdAt: Date;
}
