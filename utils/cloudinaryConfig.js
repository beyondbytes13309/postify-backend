const { v2: cloudinary } = require('cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')


const setupCloudinary = () => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'uploads/',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        }
    })

    const uploads = multer({ storage })

    return { uploads, cloudinary }
}

module.exports = { setupCloudinary }