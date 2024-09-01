import expressError from "../utils/expressError.js";
import wrapAsync from "../utils/wrapAsync.js";
import jwt from "jsonwebtoken"
import { User } from "../Models/users.js";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const verifyJWT  = wrapAsync( async (req, res, next) => {
    let token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
    
    if (!token) {
        throw new expressError(401, "Not have accessToken")
    }
    let decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    let user = await User.findById(decodeToken._id).select("-password -refreshToken");
    
    if (!user) {
        throw new expressError(401, "Invalid AccessToken");
    }
    req.user = user;

    next();
}
)
