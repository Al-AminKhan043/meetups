import { MongoClient, ObjectId } from 'mongodb';
import { Fragment } from 'react';
import Head from 'next/head';

import MeetupDetail from '../../components/meetups/MeetupDetail';

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta name='description' content={props.meetupData.description} />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

export async function getStaticPaths() {
    let client;
  
    try {
      client = await MongoClient.connect(process.env.MONGO_URI);
      const db = client.db('meetups');
      const meetupsCollection = db.collection('meetups');
  
      // Ensure you're fetching all meetups
      const meetups = await meetupsCollection.find({}, { _id: 1 }).toArray();
  
      return {
        fallback: 'blocking',  // 'blocking' means Next.js will wait for data to be fetched before rendering
        paths: meetups.map((meetup) => ({
          params: { meetupId: meetup._id.toString() },
        })),
      };
    } catch (error) {
      console.error('Error fetching meetup paths:', error);
      return {
        paths: [],
        fallback: 'blocking',  // Change this to 'true' if you want dynamic fallback
      };
    } finally {
      if (client) {
        client.close();
      }
    }
  }
  

export async function getStaticProps(context) {
  const meetupId = context.params.meetupId;
  
  let client;
  let selectedMeetup;

  try {
    client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db('meetups');
    const meetupsCollection = db.collection('meetups');

    selectedMeetup = await meetupsCollection.findOne({
      _id:new ObjectId(meetupId),
    });

    if (!selectedMeetup) {
      return {
        notFound: true, // This will trigger a 404 page if the meetup is not found
      };
    }

    return {
      props: {
        meetupData: {
          id: selectedMeetup._id.toString(),
          title: selectedMeetup.title,
          address: selectedMeetup.address,
          image: selectedMeetup.image,
          description: selectedMeetup.description,
        },
      },
      revalidate: 10, // Optional: revalidate every 10 seconds for fresh data
    };
  } catch (error) {
    console.error('Error fetching meetup data:', error);
    return {
      notFound: true, // Trigger a 404 if the data cannot be fetched
    };
  } finally {
    if (client) {
      client.close();
    }
  }
}

export default MeetupDetails;
