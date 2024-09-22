import mongoose from "mongoose" ;
import { ParameterType } from "src/common/models/enums/parameter-type";

export const ParameterSchema = new mongoose.Schema({
    type: {type: String, enum: Object.values(ParameterType),  default: ""},
    name: { type: String },
    value: { type: String },
}, {timestamps: true});

export interface Parameter {
    type: ParameterType,
    name: String,
    value: String,
}

