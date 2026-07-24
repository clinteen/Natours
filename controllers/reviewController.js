const catchAsync = require('./../utils/AsyncCatchError');
const ReviewModel = require('./../models/reviewModel');
const BookingModel = require('../models/bookingModel');
const factoryController = require('./factoryController');
const AppError = require('../utils/AppError');

exports.getAllReviews = factoryController.getAllDocuments(ReviewModel);

exports.getUserTourId = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
});

exports.hasUserBookedTour = catchAsync(async (req, res, next) => {
    const booking = await BookingModel.findOne({
        user: req.body.user,
        tour: req.body.tour
    });

    if (!booking) {
        return next(
            new AppError(
                'You cannot review a tour you have not booked! Please book the tour and try again',
                403
            )
        );
    }

    next();
});

exports.getSingleReview = factoryController.getDocument(ReviewModel);
exports.createReview = factoryController.createDocument(ReviewModel);
exports.updateReview = factoryController.updateDocument(ReviewModel);
exports.deleteReview = factoryController.deleteDocument(ReviewModel);
