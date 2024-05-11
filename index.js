const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hotel Hive is running successfully!');
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kj2w8eq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const HotelCollection = client.db('HotelHiveDB').collection('rooms');
    const BookingCollection = client.db('HotelHiveDB').collection('booking');
    app.get('/rooms', async (req, res) => {
      const cursor = HotelCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await HotelCollection.findOne(query);
      res.send(result);
    });

    app.put('/rooms/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const status = req.body;
      const updateAvailable = {
        $set: {
          availability: status.availability,
        },
      };
      const result = await HotelCollection.updateOne(
        filter,
        updateAvailable,
        options
      );
      res.send(result);
    });

    //booking related

    app.get('/booking', async (req, res) => {
      const result = await BookingCollection.find().toArray();
      res.send(result);
    });

    app.get('/my-booking/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = BookingCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/booking', async (req, res) => {
      const bookingInfo = req.body;
      const result = await BookingCollection.insertOne(bookingInfo);
      res.send(result);
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Hotel Hive server listening on port ${port}`);
});
