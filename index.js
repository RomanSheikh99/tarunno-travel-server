const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware call
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlzdh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  console.log('server is start');
  res.send('server is on');
});

async function run() {
    try {
      await client.connect();
      const database = client.db('traveler');
      const placeCollection = database.collection('places');
      const orderList = database.collection('bookList');

      // get places
      app.get('/places', async (req, res) => {
        const places = await placeCollection.find({}).toArray();
        res.send(places);
      });

      // get a Single place
      app.get('/place/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const place = await placeCollection.findOne(query);
        res.send(place);
    })
  
      //add place
      app.post('/places', async (req, res) => {
        const place = req.body;
        const result = await placeCollection.insertOne(place);
        res.json(result);
      });

      //add place to bookList
      app.post('/bookList', async (req, res) => {
        const place = req.body;
        const result = await orderList.insertOne(place);
        res.json(result);
      });

      // get booklist place 
      app.get('/mybooklist', async (req, res) => {
        const result = await orderList.find({}).toArray();
        res.send(result);
      })

      // updated booklist
      app.put('/mybooklist/:id', async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: id };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            address: updatedUser.address

          }
        };
        const result = await orderList.updateOne(filter, updateDoc,options)
        res.send(result);
      })

      // DELETE booklist
      app.delete('/mybooklist/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: id}
        const result = await orderList.deleteOne(query);
        res.json(result);
      });

      // get all booklist
      app.get('/booklist', async (req, res) => {
        const places = await orderList.find({}).toArray();
        res.send(places);
      });

       // DELETE booklist item from booklist
      app.delete('/booklist/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: id};
        const result = await orderList.deleteOne(query);
        res.json(result);
      });

        //update product
      app.put("/approved/:id", (req, res) => {
        const id = req.params.id;
        const updated = req.body;
        const filter = { _id: id };

        orderList.updateOne(filter, {
            $set: {
              status: updated.status,
            },
          })
          .then((result) => {
            res.send(result);
          });
      });


    } finally {
      // await client.close();
    }
  }
  
  run().catch(console.dir);

app.listen(port, () => {
    console.log('Running Server on port', port);
})