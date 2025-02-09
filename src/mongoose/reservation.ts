import mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';
import { ReservationStatus } from 'src/common/models/enums/reservation-status';

export const ReservationSchema = new mongoose.Schema(
  {
    number: { type: String },
    client: { type: mongoose.Types.ObjectId, ref: 'Client' },
    payment: { type: mongoose.Types.ObjectId, ref: 'TapPayment' },
    store: { type: mongoose.Types.ObjectId, ref: 'Store' },
    coupon: { type: mongoose.Types.ObjectId, ref: 'Coupon' },
    items: [{ type: mongoose.Types.ObjectId, ref: 'ReservationItem' }],
    status: {
      type: String,
      enum: ReservationStatus,
      default: ReservationStatus.CREATED,
    },
    reservationDate: { type: Date },
    reservationStartDate: { type: Date },
    reservationEndDate: { type: Date },
    tva: { type: Number },
    totalPrice: { type: Number },
    payedPrice: { type: Number },
    clientPhoneNumber: { type: Number },
    clientAddress: { type: Number },
    reports: [],
    canceledAt: { type: Date },
    notifiedBefore24h: { type: Boolean, default: false },
    notifiedBefore1h: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export interface Reservation extends mongooseDelete.SoftDeleteDocument {
  number: string;
  client: mongoose.Schema.Types.ObjectId;
  payment: mongoose.Schema.Types.ObjectId;
  store: mongoose.Schema.Types.ObjectId;
  coupon: mongoose.Schema.Types.ObjectId;
  items: mongoose.Schema.Types.ObjectId[];
  status: string;
  reservationDate: Date;
  reservationStartDate: Date;
  reservationEndDate: Date;
  tva: number;
  totalPrice: number;
  payedPrice: number;
  clientPhoneNumber: string;
  clientAddress: string;
  canceledAt: Date;
  notifiedBefore24h: boolean;
  notifiedBefore1h: boolean;
}

export type ReservationModel = mongooseDelete.SoftDeleteModel<Reservation>;
