const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// config dotenv file 
dotenv.config();

// use corse middleware 
app.use(cors());

// set json parser
app.use(express.json());

const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fotdr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


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