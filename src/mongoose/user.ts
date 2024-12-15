import mongoose from 'mongoose';
import { UserStatus } from 'src/common/models/enums/user-status';
import { UserType } from 'src/common/models/enums/user-type';

const Schema = new mongoose.Schema(
  {
    picture: { type: String, default: 'images/avatar.png' },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    country: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    email: { type: String, required: true },
    googleID: { type: String, required: false, default: '' },
    firebaseID: { type: String, required: false, default: '' },
    twitterID: { type: String, required: false, default: '' },
    phoneNumber: { type: String, required: true, unique: true },
    phoneNumberVerified: { type: Boolean, default: false },
    type: { type: String, enum: Object.values(UserType) },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.CREATED,
    },
    password: { type: String },
    salt: { type: String },
    address: { type: String, default: '' },
    lat: { type: Number, default: 0.0 },
    lng: { type: Number, default: 0.0 },
  },
  { timestamps: true },
);

export interface User extends Document {
  id: string;
  picture: string;
  username: string;
  fullName: string;
  country: string;
  city: string;
  area: string;
  email: string;
  googleID: string;
  firebaseID: string;
  twitterID: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  status: UserStatus;
  type: UserType;
  password: string;
  salt: string;
  address: string;
  lat: number;
  lng: number;
}

export const UserSchema = Schema;
