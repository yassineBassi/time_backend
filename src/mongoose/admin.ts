import mongoose from 'mongoose';
import { User, UserSchema } from './user';

export const AdminSchema = new mongoose.Schema();

AdminSchema.add(UserSchema.obj);

export interface Admin extends User {
  favotiteStores: mongoose.Schema.Types.ObjectId[];
}
