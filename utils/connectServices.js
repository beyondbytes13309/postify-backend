const mongoose = require('mongoose')

const connectToDB = async (url) => {
    mongoose.connect(url)
    .then(() => {
        console.log("Connected to DB...")
    }) 
    .catch((err) => {
        console.log("Connection to DB failed!", err.message)
        process.exit(1)
    })
}

module.exports = { connectToDB }