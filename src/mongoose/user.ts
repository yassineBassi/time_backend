import mongoose from "mongoose";
import { UserStatus } from "src/common/models/enums/user-status";

const Schema = new mongoose.Schema({
    picture: { type: String, default: "images/avatar.png" },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    country: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true},
    phoneNumberVerified: { type: Boolean, default: false },
    status: {type: String, enum: Object.values(UserStatus),  default: UserStatus.CREATED},
    password: { type: String, required: true },
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
    phoneNumber: String,
    phoneNumberVerified: boolean,
    status: UserStatus,
    password: String,
    salt: String,
    address: String,
    lat: number,
    lng: number,
}

/*Schema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};*/

export const UserSchema = Schema;