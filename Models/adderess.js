import mongoose, { Schema } from "mongoose";

const adderessSchema = new Schema({
    name:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required: true
    },
    locality:{
        type: String,
        required: true,
    },
    adderess:{
        type: String,
        required: true
    }
},{timestamps: true})