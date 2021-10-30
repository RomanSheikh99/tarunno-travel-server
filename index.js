const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xlzdh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get('/', (req, res) => {
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
        console.log(ObjectId(id))
        const place = await placeCollection.findOne(query);
        res.send(place);
    })
  
      //add place
      app.post('/places', async (req, res) => {
        const place = req.body;
        console.log('hit the post api', place);
  
        const result = await placeCollection.insertOne(place);
        console.log(result);
        res.json(result);
      });

      //add place to bookList
      app.post('/bookList', async (req, res) => {
        const place = req.body;
        console.log('hit the post api', place);
  
        const result = await orderList.insertOne(place);
        console.log(result);
        res.json(result);
      });

      // get booklist place 
      app.get('/mybooklist', async (req, res) => {
        const result = await orderList.find({}).toArray();
        res.send(result);
      })

      // updated user
      app.put('/mybooklist/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const updatedUser = req.body;
        console.log(updatedUser);
        const filter = { _id: ObjectId(id) };
        console.log('filter kore dimo tumare',filter);
        const options = {upsert: true};
        const updateDoc = {
          $set: {
            name: updatedUser.name,
            email: updatedUser.email
          }
        };
        const result = await orderList.updateOne(filter, updateDoc, options)
        console.log(result);
        res.send(result);
      })
      
      // DELETE API
      app.delete('/mybooklist/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)}
        const result = await orderList.deleteOne(query);
        res.json(result);
      });


    } finally {
      // await client.close();
    }
  }
  
  run().catch(console.dir);

app.listen(port, () => {
    console.log('Running Genius Server on port', port);
})