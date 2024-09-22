import mongoose from "mongoose";
import { UserStatus } from "src/common/models/enums/user-status";
import { UserType } from "src/common/models/enums/user-type";

const Schema = new mongoose.Schema({
    picture: { type: String, default: "images/avatar.png" },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    country: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    email: { type: String, required: true },
    googleID: { type: String, required: false, default: "" },
    firebaseID: { type: String, required: false, default: "" },
    phoneNumber: { type: String, required: true, unique: true},
    phoneNumberVerified: { type: Boolean, default: false },
    type: {type: String, enum: Object.values(UserType)},
    status: {type: String, enum: Object.values(UserStatus),  default: UserStatus.CREATED},
    password: { type: String },
    salt: { type: String },
    address: { type: String, default: ""},
    lat: { type: Number, default: 0.0 },
    lng: { type: Number, default: 0.0 },
}, {timestamps: true});

export interface User extends Document {
    id: String,
    picture: String,
    username: String,
    fullName: String,
    country: String,
    city: String,
    area: String,
    email: String,
    googleID: String,
    firebaseID: String,
    phoneNumber: String,
    phoneNumberVerified: boolean,
    status: UserStatus,
    type: UserType,
    password: String,
    salt: String,
    address: String,
    lat: number,
    lng: number,
}

export const UserSchema = Schema;