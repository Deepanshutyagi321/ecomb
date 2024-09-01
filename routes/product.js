
import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { Product } from "../Models/product.js";
import { Category } from "../Models/category.js";
import { verifyJWT } from "../middlewares/auth.js";

import dotenv from 'dotenv';

dotenv.config({ path: './.env' });


const router = Router();


router.route("/").get(wrapAsync(async (req, res) => {
    let product = await Product.find();
    res.json({ product });
}));

//product add route
router.route("/").post(verifyJWT, wrapAsync(async (req, res) => {
    // console.log(req);
    // console.log(req.body.formData.category);
    let user = req.user._id;
    // console.log(user);
    let category = await new Category({ name: req.body.formData.category });
    let product = new Product({
        title: req.body.formData.title,
        description: req.body.formData.description,
        productImage: req.body.formData.image,
        price: req.body.formData.price,
        category: category.id,
        owner: user
    });
    // console.log(product);
    await product.save();
    await category.save();




    res.json({ message: 'Data received successfully' });
}));


//edit show route
router.route("/:id").get(verifyJWT, wrapAsync(async (req, res) => {
    // console.log(req.params.id);
    const product = await Product.findById(req.params.id).populate("category")
    res.json({ product });
}));

//delete route
router.route("/:id").delete(verifyJWT, wrapAsync(async (req, res) => {
    console.log(req.params.id);
    let deleteProduct = await Product.findByIdAndDelete(req.params.id)
    res.send({ deleteProduct });
}));
//edit route
router.route("/:id/edit").put(wrapAsync(async (req, res) => {

    const productId = req.params.id;

    // Fetch the product by ID and populate the 'category' field
    const product = await Product.findById(productId).populate("category");


    // Update the product details
    await product.updateOne({
        title: req.body.formData.title,
        description: req.body.formData.description,
        productImage: req.body.formData.productImage,
        price: req.body.formData.price,
    });

    // Update the category details
    const categoryId = product.category[0].id;
    const category = await Category.findById(categoryId);

    if (!category) {
        return res.status(404).send("Category not found");
    }

    await category.updateOne({ name: req.body.formData.category });

    // Fetch the updated product to populate the 'category' field
    const updatedProduct = await Product.findById(productId).populate("category");

    res.send({ product: updatedProduct });

}));
// search product

router.route("/search").post(wrapAsync(async (req, res) => {
    let { search } = req.body
    const query = { $text: { $search: search } }
    const searchData = await Product.find(query);
    res.send("done")
}))

export default router;