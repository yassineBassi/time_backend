import mongoose from "mongoose";
import { User, UserSchema } from './user'; 


export const StoreSchema = new mongoose.Schema({
});

export interface Store extends User {
    
}

