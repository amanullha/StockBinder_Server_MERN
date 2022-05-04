const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// middleware
app.use(cors());
// help to convert data to json 
app.use(express.json());



app.get('/', (req, res) => {
    res.send('running server side for the warehouse(backend)')
})

app.listen(port, () => {
    console.log("listening warehouse(backend) with port :", port);
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = "mongodb+srv://stockBlinderUser1:4ZxzYVfmXztB9pty@cluster0.lda5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        await client.connect();

        const phoneCollection = client.db("stockBinderProducts").collection("phones");



        // get total phone count / get the total products
        app.get('/phones-count', async (req, res) => {

            const query = {};

            const phonesCount = await phoneCollection.estimatedDocumentCount();

            res.send({ phonesCount });

        })


        // get all the phone by filtering based on query 
        app.get('/phones', async (req, res) => {

            console.log("query: ", req.query);

            const currentPageNbr = parseInt(req.query.currentPageNbr);
            const totalPhoneInPage = parseInt(req.query.totalPhoneInPage);

            const totalSkipPhones = (currentPageNbr - 1) * totalPhoneInPage;


            const query = {};

            const cursor = phoneCollection.find(query);


            if (currentPageNbr || totalPhoneInPage) {
                console.log("hello um in ");
                const phones = await cursor.skip(totalSkipPhones).limit(totalPhoneInPage).toArray();
                res.send(phones);
            }
            else {
                const phones = await cursor.toArray();
                res.send(phones);
            }




        })

        // get single phone by phone_id
        app.get('/phones/:_id', async (req, res) => {

            const _id = req.params._id;
            console.log(_id);

            const query = { _id: ObjectId(_id) };

            const cursor = phoneCollection.find(query);
            const phone = await cursor.toArray();

            res.send(phone);

        })

        // update phone quantity and sold items
        app.put('/phones/:_id', async (req, res) => {

            const _id = req.params._id;
            console.log(_id);

            const updatedPhone = req.body;

            const filter = { _id: ObjectId(_id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    quantity: updatedPhone.quantity,
                    soldItems: updatedPhone.soldItems
                }
            }
            const result = await phoneCollection.updateOne(filter, updatedDoc, options);

            res.send(result);



        })


        // Add item to the database
        app.post('/phones', async (req, res) => {

            const newPhone = req.body;
            const result = await phoneCollection.insertOne(newPhone);
            res.send(result);

        })

        // delete a phone by phone_id
        app.delete('/phones/:_id', async (req, res) => {

            const _id = req.params._id;
            console.log(_id);

            const query = { _id: ObjectId(_id) };

            const result = await phoneCollection.deleteOne(query);

            res.send(result);

        })

    } finally {

    }

}
run().catch(console.dir);



//user: stockBlinderUser1
// password: 4ZxzYVfmXztB9pty