import {v2 as cloudinary} from "cloudinary";
import {config} from 'dotenv';

config();

console.log(process.env.VITE_CLOUDINARY_CLOUD_NAME);  // Should not be undefined
console.log(process.env.CLOUDINARY_API_KEY);    // Should not be undefined
console.log(process.env.CLOUDINARY_API_SECRET); // Should not be undefined
cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.VITE_CLOUDINARY_API_KEY,
    api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
})

export default cloudinary;