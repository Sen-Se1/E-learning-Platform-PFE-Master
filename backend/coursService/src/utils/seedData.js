const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../schemas/courseSchema');

// Use path.join to avoid relativity issues
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Connect to DB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('DB Connected for seeding...');
}).catch((err) => {
  console.log(`DB Error: ${err}`);
  process.exit(1);
});

// Read JSON data
const courses = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../courses_seed.json'), 'utf-8')
);

// Insert data into DB
const importData = async () => {
  try {
    await Course.deleteMany(); // Clear existing data
    await Course.create(courses);
    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Course.deleteMany();
    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
