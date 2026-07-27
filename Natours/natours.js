// const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./../utils/AppError');
const errorController = require('./../controllers/errorController');
const tourRouter = require('./../routes/tourRoutes');
const userRouter = require('./../routes/userRoutes');
const reviewRouter = require('./../routes/reviewRoutes');
const bookingsRouter = require('./../routes/bookingsRoutes');
const bookingController = require('./../controllers/bookingsController');
const viewsRouter = require('../routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', `${__dirname}/../views`);

// This is for heroku, because heroku redirects every request to a proxy, This settings allows vscode to trust heroku
// app.enable('trust proxy');

//1. MIDDLEWARE

// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             scriptSrc: ["'self'", 'https://unpkg.com'],
//             styleSrc: ["'self'", 'https://unpkg.com', "'unsafe-inline'"],
//             imgSrc: [
//                 "'self'",
//                 'data:',
//                 'blob:',
//                 'https://*.tile.openstreetmap.org',
//                 'https://*.basemaps.cartocdn.com', // add this for CartoDB
//                 'https://unpkg.com'
//             ],
//             connectSrc: [
//                 "'self'",
//                 'https://unpkg.com',
//                 'https://*.basemaps.cartocdn.com',
//                 'http://127.0.0.1:3000'
//             ]
//         }
//     })
// );


app.post('/webhook-checkout', express.raw({type: 'application/json'}), bookingController.webhookCheckOut)

// Body parser and reading data from body to req.body

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.set('query parser', 'extended');
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    // Sanitize body
    if (req.body)
        req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });

    // Sanitize params
    if (req.params)
        req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });

    // Sanitize query - manual assign to avoid getter error
    if (req.query) {
        const cleanQuery = mongoSanitize.sanitize(req.query, {
            replaceWith: '_',
            allowDots: true
        });
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, cleanQuery);
    }

    next();
});

// Data Sanitization against NoSql Query Injection

// app.use(
//     mongoSanitize({
//         replaceWith: "_",
//         allowDots: true,
//     })
// );

// Data Sanitization against XSS

app.use(xss());

// Development Logging

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limiting requests from the same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP! Please try again in an hour'
});

app.use('/api', limiter);

app.use(hpp());

// app.use(hpp({
//         whitelist: [
//             "duration",
//             "ratingsQuantity",
//             "ratingsAverage",
//             "maxGroupSize",
//             "difficulty",
//             "price",
//         ],
//     }));

app.use(compression());

// Reading static files

app.use(express.static(`${__dirname}/../public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

//3.) ROUTES
app.get('/testing', (req, res) => {
    res.render('test');
});

app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingsRouter);

app.all('/{*splat}', (req, res, next) => {
    const err = new AppError(
        `Cannot find this url: ${req.originalUrl} on this server`,
        404
    );

    next(err);
});

app.use(errorController);

module.exports = app;
