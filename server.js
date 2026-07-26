const mongoose = require('mongoose');
const dotenv = require('dotenv');

const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('UnCaught Exception: Shutting down');

    process.exit(1);
});

dotenv.config({ path: './config.env' });
console.log(process.env.NODE_ENV);

const app = require('./Natours/natours');

// mongoose.connect(process.env.CLOUD_DATABASE).then((con) => {
//     console.log('DB connected successfully');
// });
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
const server = app.listen(port, () => {
    console.log(`Running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled Rejection: Shutting down.....');
    server.close(() => {
        process.exit(1);
    });
});
