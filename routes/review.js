
import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { Review } from "../Models/review.js";
import { Cart } from "../Models/Cart.js";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const router = Router();


// Add new Review
router.route("/product/review").post(wrapAsync(async(req,res)=>{
let review = req.body;
const newReview = new Review(review);
await newReview.save();
res.json({ message: 'Data received successfully' });
}));

export default router;