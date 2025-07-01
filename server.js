const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require("path");
require('dotenv').config()

const { User } = require('./models/User');
const { connectToDB } = require('./utils/connectServices.js');

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded( { extended: true } ))
app.use(cors({
    origin: '*'
}))

const mainFunction = async () => {

    await connectToDB(process.env.MONGODB_CONNECTION_STRING)

}

app.get('/', (req, res) => {
    return res.send("Good to go!")
})

app.listen(PORT, () => {
    mainFunction()
    console.log("Server is running...")
})