import { MongoClient } from 'mongodb';

// /api/new-meetup
// POST /api/new-meetup

async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    // Validation
    if (!data.title || !data.address || !data.image || !data.description) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
      const client = await MongoClient.connect(process.env.MONGO_URI);
      const db = client.db();
      const meetupsCollection = db.collection('meetups');

      const result = await meetupsCollection.insertOne({
        title: data.title,
        address: data.address,
        image: data.image,
        description: data.description,
      });

      console.log(result);

      client.close();

      res.status(201).json({ message: 'Meetup inserted!' });
    } catch (error) {
      console.error('Error inserting meetup:', error);
      res.status(500).json({ message: 'Could not insert meetup!' });
    }
  }
}

export default handler;
