const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModels');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/AsyncCatchError');
const AppError = require('./../utils/AppError');
const factoryController = require('./factoryController');

exports.bookingSession = catchAsync(async (req, res, next) => {
    // 1.) Get the selected tour from the database
    const tour = await Tour.findById(req.params.tourId);
    const selectedDate = tour.startDates.id(req.query.startDate);
    // 2.) Create the stripe payment session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}&startDate=${selectedDate._id}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: `summary: ${tour.summary}\nDate: ${selectedDate.date.toDateString()}`,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`
                        ]
                    },
                    unit_amount: tour.price * 100 // amount in cents
                },
                quantity: 1
            }
        ]
        // line_items: [
        //     {
        //         name: `${tour.name} Tour`,
        //         description: tour.summary,
        //         images: [
        //             `https://www.natours.dev/img/tours/${tour.imageCover}`
        //         ],
        //         amount: tour.price * 100,
        //         currency: 'usd',
        //         quantity: 1
        //     }
        // ]
    });

    // 3.) Send the session to the user
    // res.status(200).json({
    //     status: 'success',
    //     session
    // });

    res.status(200).json({
        status: 'success',
        session_url: session.url
    });
});

exports.createBookingAuto = catchAsync(async (req, res, next) => {
    // This method was temporary because it is UNSECURE
    const { tour, user, price, startDate } = req.query;

    if (!tour && !user && !price && !startDate) return next();

    const tourId = await Tour.findById(tour);
    const selectedDate = tourId.startDates.id(startDate);
    // console.log(req.query);

    await Booking.create({
        tour: tour,
        user: user,
        price: price,
        startDate: selectedDate.date
    });

    selectedDate.participants = selectedDate.participants + 1;
    await tour.save({ validateBeforeSave: false });

    res.redirect('/');
});

exports.getAllBookings = factoryController.getAllDocuments(Booking);

exports.getSingleBooking = factoryController.getDocument(Booking, {
    path: 'user',
    select: 'name email'
});

exports.updateBooking = factoryController.updateDocument(Booking);

exports.addTourParticipants = catchAsync(async (req, res, next) => {
    const tourId = await Tour.findById(req.body.tour);

    const selectedDate = tourId.startDates.find(
        (el) =>
            el.date.toISOString().split('T')[0] ===
            new Date(req.body.startDate).toISOString().split('T')[0]
    );
    if (!selectedDate)
        return next(new AppError('This tour does not have this date', 404));

    selectedDate.participants += 1;

    if (selectedDate.participants >= tourId.maxGroupSize) {
        selectedDate.soldOut = true;
    }

    await tourId.save({ validateBeforeSave: false });

    next();
});

exports.createBooking = factoryController.createDocument(Booking);

exports.deleteBooking = factoryController.deleteDocument(Booking);
