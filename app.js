const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
// config dotenv file 
dotenv.config();

// use corse middleware 
app.use(cors());

// set json parser
app.use(express.json());

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fotdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
//  verify jwt token
// const verifyToken = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     console.log(authHeader)
//     if (!authHeader) {
//         return res.status(401).json({ message: "unauthorized access" })
//     }
//     const token = authHeader.split(' ')[1];
//     const decoded = await jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decoded);
// }

const run = async () => {
    try {
        // access sock market db service schema
        const serviceCollection = client.db("StockMarket").collection("services");
        const reviewCollection = client.db("StockMarket").collection("reviews");
        app.get('/', (req, res) => {
            res.status(200).send('Hello world')
        })
        // get all services
        app.get('/service', async (req, res) => {
            const dataLimit = req.query;
            const limit = parseInt(dataLimit.limit)
            const query = {}
            const cursor = serviceCollection.find(query).limit(limit);
            const result = await cursor.toArray();
            res.send(result)
        })
        // get a service
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })
        // add a service
        app.post('/service', async (req, res) => {
            const serviceDoc = req.body
            const result = await serviceCollection.insertOne(serviceDoc)
            res.send(result)

        })
        // get review
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        //add user review
        app.post('/review', async (req, res) => {
            const reviewDoc = req.body
            const result = await reviewCollection.insertOne(reviewDoc)
            if (result) {
                res.send({ result, reviewDoc })
            }
        })

        // jwt authentication implemantation
        app.post('/jwt', async (req, res) => {
            const payload = req.body;
            const token = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.send({ token })
            // console.log(token)
        })
        // get email by review
        app.post('/my-reviews', async (req, res) => {
            const { email } = req.body
            const query = { reviewerEmail: email }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        // get single review
        app.get('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })
        // update review
        app.put('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const { updateValue } = req.body;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    reviewMsg: updateValue
                },
            };
            const result = await reviewCollection.updateOne(query, updateDoc, options);
            res.send(result)
        })
        // delete a review
        app.delete('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
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