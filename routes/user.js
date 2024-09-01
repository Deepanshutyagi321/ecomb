
import { Router } from "express";
import { User } from "../Models/users.js"
import wrapAsync from "../utils/wrapAsync.js";
import ExpressError from "../utils/expressError.js";
import { upload } from "../middlewares/multer.js";
import expressError from "../utils/expressError.js";
import { uploadOnCloudinary } from "../utils/Cloudconfig.js";
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { ApiResponse } from "../utils/apiResponse.js";

import { verifyJWT } from "../middlewares/auth.js"




const router = Router();


//generate access or refreshtoken

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new expressError(500, "Something went wrong while generating referesh and access token")
    }
}
//register route

router.route("/register").post( upload.fields([{ name: "avatar", maxCount: 1 }]), wrapAsync(async (req, res) => {

    let { username, email, password, fullname } = req.body;
    

    //check the these fields empty or not
    if ([fullname, username, email, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new expressError(400, "All fields are required")
    }
    let existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        // console.log(existedUser)
        throw new expressError(409, "User with email or password is already Register")
    }

    //find the local path of multer file upload
    let localFilePath = req.files?.avatar?.[0]?.path;
    console.log(localFilePath)
     
    if (!localFilePath) {
        throw new Error(400, "Avatar not available");
    }

    //upload local file on cloudinary
    
    let avatarUrl = await uploadOnCloudinary(localFilePath);
    // console.log("Avatar URL:", avatarUrl);

    
    if (!avatarUrl.secure_url) {
        throw new Error(400, "Avatar not available");
    }

    //extrect upload file url from cloudinay
    let userAvatar = avatarUrl.secure_url;




    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        avatar: userAvatar,
        password
    });

    //remove password or reFreshToken fields from response
    let createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ExpressError(500, "Something went wrong while Register the user");
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, " User created succesfully")
    )

}));




// login route
router.route("/login").post( wrapAsync(async (req, res) => {
   
    const {email, username, password} = req.body
    console.log(email);
console.log(req.body);
    // if (!username && !email) {
    //     throw new ExpressError(400, "username or email is required")
    // }

    //Here is an alternative of above code based on logic discussed in video:
    if (!(username || !email)) {
        throw new ExpressError(400, "username or email is required")
        
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    

    if (!user) {
        throw new ExpressError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ExpressError(401, "Invalid user credentials")
    }
    console.log(user._id);

    const { accessToken, refreshToken  } = await generateAccessAndRefereshTokens(user._id);


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )




}));
//logout route
router.route("/logout").post( verifyJWT, wrapAsync(async (req, res) => {
    
    const userId = req.user._id; // Accessing user ID
    // console.log(userId);
    
    await User.findByIdAndUpdate(userId,
        {
            $unset: {
                refreshToken: 1 // Remove the refreshToken field from the document
            }
        },
        {
            new: true
        });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    };

    // Clear cookies
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json(new ApiResponse(200, {}, "User logout"));
}));

// provide user detail
router.route("/user").get(verifyJWT,wrapAsync(async (req, res) => {
    let userId = req.user._id;
    // console.log(userId)
    let user = await User.findById(userId);
    // console.log(user);
  
    res.json(new ApiResponse(
        200, 
        { user },
        "user Detail"
    ));
}));

export default router;