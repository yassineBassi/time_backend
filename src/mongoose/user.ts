import mongoose from 'mongoose';
import { UserStatus } from 'src/common/models/enums/user-status';
import { UserType } from 'src/common/models/enums/user-type';

const Schema = new mongoose.Schema(
  {
    picture: {
      type: String,
      default: 'public/images/clients/default-client.jpeg',
    },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    country: { type: String },
    city: { type: String },
    area: { type: String },
    email: { type: String, required: true },
    googleID: { type: String, required: false, default: '' },
    firebaseID: { type: String, required: false, default: '' },
    twitterID: { type: String, required: false, default: '' },
    appleID: { type: String, required: false, default: '' },
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
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    notificationToken: { type: String }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

Schema.index({ geoLocation: '2dsphere' });

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

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
  appleID: string;
  phoneNumber: string;
  phoneNumberVerified: boolean;
  status: UserStatus;
  type: UserType;
  password: string;
  salt: string;
  address: string;
  geoLocation: GeoJSONPoint;
  lat: number;
  lng: number;
  notificationToken: string;
}

Schema.virtual('lat').get(function (this: User) {
  return this.geoLocation.coordinates[1];
});

Schema.virtual('lng').get(function (this: User) {
  return this.geoLocation.coordinates[0];
});

export const UserSchema = Schema;
