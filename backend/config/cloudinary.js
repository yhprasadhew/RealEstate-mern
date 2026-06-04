import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

export default cloudinary;

//cloud namec duxtbovr5
//apikey 961312965759235

/* Here are my Cloudinary credentials:
Cloud Name: duxtbovr5
API Key: 961312965759235
API Secret: <INSERT_API_SECRET>

*/