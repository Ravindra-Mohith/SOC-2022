const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/../../config.env` });
const server = require('express')();
const fs = require('fs');
const Tour = require(`${__dirname}/../../models/tourModel`);
const User = require(`${__dirname}/../../models/userModel`);
const Review = require(`${__dirname}/../../models/reviewModel`);

const PORT = process.env.PORT || 5000;
const arguments = process.argv;

mongoose
  .connect('mongodb://localhost:27017/natours', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.log(e);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  //we need to pass in an array of objects in create function to import data
  try {
    await Tour.create(tours);
    // await User.create(users);
    // await Review.create(reviews);
    console.log('data loaded successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
    console.log('data deleted successfully');
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (arguments[2] === '--import') {
  importData();
} else if (arguments[2] === '--delete') {
  deleteData();
}

server.listen(PORT, () => {
  console.log('Server running on port 5000');
});
