import mongoose, { Schema } from "mongoose";
import { Category } from "./category.js";

const productSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
    ref: "User",
    required: true

    },
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    productImage:{
        type: String,
        default: "https://m.media-amazon.com/images/I/414DPdYPVnL._SX300_SY300_QL70_FMwebp_.jpg",
    },
     price:{
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
              throw new Error("Price cannot be negative");
            }
        }
     },
     category:[{
        type: Schema.Types.ObjectId,
        ref: "Category"
    }],
  

}, { timestamps: true });

productSchema.index({ title: "text", description: "text" });


productSchema.post("findOneAndDelete", async (product) => {
    if (product) {
        await Category.deleteMany({ _id: { $in: product.category } });
    }
});


export const Product = mongoose.model("Product",productSchema);