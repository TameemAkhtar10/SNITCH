import ImageKit from '@imagekit/nodejs'
import config from '../config/config.js';

const imagekit = new ImageKit({ 
    privateKey : config.IMAGEKIT_PRIVATE_KEY,
    publicKey : "public_9Zt7n1sHh8Xl5mLh2uQe3qjvM=",
    urlEndpoint : 'https://ik.imagekit.io/4kqj6c9g0'
})

export const uploadImage = async (req, res) => {
    try {
        const file = req.file.buffer;
        const fileName = `${Date.now()}_${req.file.originalname}`;

        const response = await imagekit.upload({
            file: file,
            fileName: fileName
        }); 
        res.status(200).json(response); 
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Failed to upload image" });
    }
}