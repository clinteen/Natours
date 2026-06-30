const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/AsyncCatchError');
const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'Overview Of All Tours',
        tours: tours
    });
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    });
};

exports.getTourBySlug = catchAsync(async (req, res, next) => {
    const { tourSlug } = req.params;
    const tour = await Tour.findOne({ slug: tourSlug }).populate({
        path: 'reviews',
        fields: 'rating review user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with this Name!', 404));
    }

    res.status(200).render('tour', {
        title: tour.name,
        tour: tour
    });
});

exports.getLoginPage = (req, res) => {
    res.status(200).render('login', {
        title: 'Login into Your account'
    });
};

exports.getAccountPage = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const bookings = await Booking.find({ user: user });

    const tourIDs = bookings.map((el) => {
        return el.tour;
    });
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours: tours
    });
});

exports.submitUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            returnDocument: 'after',
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser
    });
});
