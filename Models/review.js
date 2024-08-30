//review Schema


import mongoose, { Schema } from "mongoose";

let reviewSchema = new Schema({
    review:{
        type: String,
        required: true
    },
    star:{
        type: Number,
        required: true
    }
},{timestamps:true})

export const Review = mongoose.model("Review", reviewSchema);