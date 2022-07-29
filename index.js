require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
// const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

const app = express();
app.use(cors()); //middleware
app.use(express.json());

const uri = `mongodb+srv://${process.env.REACT_APP_USERNAME}:${process.env.REACT_APP_PASSWORD}@cluster0.ce7h0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("E24Games");
        const quesCollection = database.collection("questions");

        //Get Api for offers
        app.post('/api/Quiz/StartQuiz', async (req, res) => {
            //     const token = req.body; //console.log(req.body);
            const cursor = quesCollection.find({});
            const offers = await cursor.toArray();
            res.send(offers);
        })

        //Post Api for orders
        // app.post('/add-order', async(req, res) => {
        //     const order = req.body; //console.log(req.body);
        //     const result = await ordersCollection.insertOne(order);

        //     console.log('An order was inserted:', result);
        //     res.json(result); //output on client site as a json
        // })

        //Put Api for admin
        // app.put('/users/admin', async(req, res) => {
        //     const user = req.body; 
        //     const filter = { email: user.email };
        //     const updateDoc = { $set: {role: 'admin'} };

        //     const result = await userCollections.updateOne(filter, updateDoc);
        //     res.json(result);
        // })

    } finally {
    //   await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is loading!');
})

app.listen(port, () => console.log('Server is loading at port@5000'));