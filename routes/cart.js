
import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { Product } from "../Models/product.js";
import { Cart } from "../Models/Cart.js";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
const router = Router();


//add item in cart
router.route("/product/cart/:id").post( wrapAsync(async (req, res) => {
    let productId = req.params.id;

    let product = await Product.findById(productId);
    let cartProduct = await Cart.find({ 'item.id': product.id });


    let { title, price, id, productImage } = product;
    if (Array.isArray(cartProduct) && cartProduct.length > 0) {
        // Product is already in the cart, increment the quantity
        cartProduct[0].item.qunantity++;
        await cartProduct[0].save(); // Note: You need to save the specific item, not the whole array
    } else {
        let cartproducts = new Cart({
            modifiedOn: new Date(),
            item: {
                name: title,
                itemPrice: price,
                id: id,
                qunantity: 1,
                itemImage: productImage,
            }
        });
        await cartproducts.save();
    }

    //    console.log(id);
    res.send("done");
}));

// cart product find route
router.route("/cart").get( wrapAsync(async (req, res) => {
    let cartproduct = await Cart.find();
    // console.log(cartproduct);
    res.json({ cartproduct });
}));

//delete cart item 
router.route("/cart/:id").delete(wrapAsync(async(req,res)=>{
    let iteamId = req.params.id;
    console.log(iteamId);
   let cartIteam =  await Cart.findOne({"item.id": iteamId})

   //check cartIteam exist or not
   if (!cartIteam) {
    return res.status(404).send("Cart item not found");
}

// If the cart item exists, remove it
await cartIteam.deleteOne();
   
    res.send("done");
}))

export default router;