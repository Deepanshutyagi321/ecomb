import mongoose, { Schema } from "mongoose";


const cartSchema = new Schema(
  {
    modifiedOn: Date,
    item: 
      {
        qunantity: {
          type:Number,
          default: 1
        },
        name: String,
        itemPrice: Number,
        itemImage: String,
        id: String,
      }
    
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart",cartSchema);