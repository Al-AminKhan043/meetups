import { Fragment } from 'react';
import Head from 'next/head';
import { MongoClient } from 'mongodb';

import MeetupList from '../components/meetups/MeetupList';

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name='description'
          content='Browse a huge list of highly active React meetups!'
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}

export async function getStaticProps() {
  let client;
  let meetups = [];

  try {
    // Fetch data from MongoDB
    client = await MongoClient.connect(process.env.MONGO_URI); // Use environment variable
    const db = client.db();
    const meetupsCollection = db.collection('meetups');

    meetups = await meetupsCollection.find().toArray();
  } catch (error) {
    console.error('Error fetching meetups:', error);
  } finally {
    if (client) {
      client.close();
    }
  }

  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    revalidate: 1, // Enable revalidation
  };
}

export default HomePage;
