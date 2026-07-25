const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModels');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.CLOUD_DATABASE).then((con) => {
    // console.log(con.connections);
    console.log('DB connected successfully');
});
// mongoose.connect(process.env.DATABASE).then((con) => {
//     // console.log(con.connections);
//     console.log('DB connected successfully');
// });

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../tours.json`, 'utf-8')
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/../users.json`, 'utf-8')
);
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/../reviews.json`, 'utf-8')
);

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('Data saved successfully!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted successfully!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
