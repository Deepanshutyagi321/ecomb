
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:  process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath)=>{
    try{
   //check avaibility of file path
   if(!localFilePath) return null
   
   const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto",
        folder: "ECOM_DEV"
    });
    //file is successfully upload on cloudinary
    // console.log(response);
    fs.unlinkSync(localFilePath);
    return response;
}catch(error){
 fs.unlinkSync(localFilePath);
 return null;
}
}

export{uploadOnCloudinary};