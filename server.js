const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UnCaught Exception: Shutting down');

    process.exit(1);
});

dotenv.config({ path: './config.env' });
console.log(process.env.NODE_ENV);

const app = require('./Natours/natours');

mongoose.connect(process.env.DATABASE).then((con) => {
    // console.log(con.connections);
    console.log('DB connected successfully');
});

// Start server
// const testTour = Tour({
//     name: "Theodore Bagwell",
//     price: 250,
// });

// testTour
//     .save()
//     .then((doc) => console.log(doc))
//     .catch((err) => console.log(err));

// console.log(process.env);

//4.) STARTING THE SERVER
const server = app.listen(3000, () => {
    console.log('Running on port 3000');
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection: Shutting down.....');
    server.close(() => {
        process.exit(1);
    });
});
