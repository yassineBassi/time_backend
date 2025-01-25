import mongoose from 'mongoose';

export const TapPaymentSchema = new mongoose.Schema(
  {
    transaction_id: { type: String },
    tyoe: { type: String },
    version: { type: String },
    statut: { type: String },
    amount: { type: String },
    currency: { type: String },
    isThreeDSecure: { type: Boolean },
    transaction_date: { type: Date },
    customer_id: { type: String },
    customer_type: { type: String },
    customer_name: { type: String },
    customer_email: { type: String },
    customer_phone_number: { type: String },
    merchant_id: { type: String },
    type: { type: String },
    responeBody: { type: String }
  },
  { timestamps: true },
);

export interface TapPayment {
  transaction_id: string;
  tyoe: string;
  version: string;
  statut: string;
  amount: string;
  currency: string;
  isThreeDSecure: boolean;
  transaction_date: Date;
  customer_id: string;
  customer_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  merchant_id: string;
  type: string;
  responeBody: string
}
