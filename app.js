const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

// config dotenv file 
dotenv.config();

// use corse middleware 
app.use(cors());

// set json parser
app.use(express.json());

const port = process.env.PORT || 5000;

const run = async () => {
    try {

        app.get('/', (req, res) => {
            res.status(200).send('Hello world')
        })
    } catch (err) {
        console.log(err)
    }
}

run().catch(err => {
    console.log(err)
})




//setup 404 routes
app.use((req, res, next) => {
    res.status(404).json({
        msg: 'Route is not found'
    })
})

// setup default error handlers
app.use((err, req, res, next) => {
    if (err) {
        console.log(err)
    }
})

// setup server running port

app.listen(port, (err) => {
    if (!err) {
        console.log(`server is running port on ${port}...`)
    }
})