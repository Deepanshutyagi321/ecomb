
import express from "express";
import cors from "cors"
import mongoose from 'mongoose';
import ExpressError from "./utils/expressError.js";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import cookieParser from "cookie-parser";

//route import
import productRoute from "./routes/product.js"
import cartRoute from "./routes/cart.js"
import userRoute from "./routes/user.js"
import reviewRoute from "./routes/review.js"


const app = express();
let port = 8080;
const DB_url = process.env.MONGODB_URL;

const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173/',
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


main().then(() => {
    console.log("connect to DB")
}).catch((err) => {
    console.log(err);
})

async function main() {
    
    mongoose.connect(DB_url)
}
app.get("/", (req, res) => {
    res.send("done");
});


app.use("/api/product", productRoute);
app.use("/api", cartRoute)
app.use("/api", userRoute)
app.use("/api", reviewRoute)

//error handler for wrong address
app.all("*", (req, res, next) => {
    next(new ExpressError(401, "Page not found"));
})

// err handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Some thing went wrong" } = err;
    // res.status(statusCode).send(message);
    console.log(message)
    res.json({ message });

    // console.log(message);
})

app.listen(port, () => {
    console.log("server listing to 8000")
    console.log(process.env.PORT);
})