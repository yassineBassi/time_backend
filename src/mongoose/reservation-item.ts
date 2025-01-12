import mongoose from 'mongoose';
import * as mongooseDelete from 'mongoose-delete';

export const ReservationItemSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Types.ObjectId, ref: 'Service' },
    reservation: { type: mongoose.Types.ObjectId, ref: 'Reservation' },
    price: { type: Number },
    quantity: { type: Number },
    duration: { type: Number },
  },
  { timestamps: true },
);

export interface ReservationItem extends mongooseDelete.SoftDeleteDocument {
  service: mongoose.Schema.Types.ObjectId;
  reservation: mongoose.Schema.Types.ObjectId;
  price: number;
  quantity: number;
  duration: number;
}

export type ReservationModel = mongooseDelete.SoftDeleteModel<ReservationItem>;
