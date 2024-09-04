import { connect } from '../lib/db.js';
import Sport from '../models/Sport.js';
import { v4 as uuidv4 } from 'uuid';

const sports = [
  "Men's Basketball", "Women's Basketball",
  "Men's Beach Volleyball", "Women's Beach Volleyball",
  "Men's Bowling", "Women's Bowling",
  "Men's Cheerleading", "Women's Cheerleading",
  "Men's Cross Country", "Women's Cross Country",
  "Men's Equestrian", "Women's Equestrian",
  "Men's ESports", "Women's ESports",
  "Men's Fencing", "Women's Fencing",
  "Men's Field Hockey", "Women's Field Hockey",
  "Men's Golf", "Women's Golf",
  "Men's Gymnastics", "Women's Gymnastics",
  "Men's Ice Hockey", "Women's Ice Hockey",
  "Men's Lacrosse", "Women's Lacrosse",
  "Men's Rifle", "Women's Rifle",
  "Men's Rowing", "Women's Rowing",
  "Men's Rugby", "Women's Rugby",
  "Men's Skiing", "Women's Skiing",
  "Men's Soccer", "Women's Soccer",
  "Men's Softball", "Women's Softball",
  "Men's Swimming & Diving", "Women's Swimming & Diving",
  "Men's Tennis", "Women's Tennis",
  "Men's Track & Field", "Women's Track & Field",
  "Men's Triathlon", "Women's Triathlon",
  "Men's Volleyball", "Women's Volleyball",
  "Men's Water Polo", "Women's Water Polo",
  "Men's Wrestling", "Women's Wrestling",
  "Men's Baseball",
  "Men's Football"
];

async function populateSports() {
  try {
    await connect();
    console.log('Connected to the database');

    for (const sportName of sports) {
      const existingSport = await Sport.findOne({ name: sportName });
      if (!existingSport) {
        const newSport = new Sport({
          sportId: uuidv4(),
          name: sportName,
        });
        await newSport.save();
        console.log(`Added sport: ${sportName}`);
      } else {
        console.log(`Sport already exists: ${sportName}`);
      }
    }

    console.log('Sports population completed');
  } catch (error) {
    console.error('Error populating sports:', error);
  } finally {
    process.exit();
  }
}

populateSports();