import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in the environment variables.");
    process.exit(1);
}
if(!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in the environment variables.");
    process.exit(1);
}
if(!process.env.GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_CLIENT_ID is not defined in the environment variables.");
    process.exit(1);
}
if(!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("GOOGLE_CLIENT_SECRET is not defined in the environment variables.");
    process.exit(1);
}
if(!process.env.GOOGLE_CALLBACK_URL) {
    console.error("GOOGLE_CALLBACK_URL is not defined in the environment variables.");
    process.exit(1);
}
if(!process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error("IMAGEKIT_PRIVATE_KEY is not defined in the environment variables.");
    process.exit(1);
}

const config = {    
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET

}
export default config;