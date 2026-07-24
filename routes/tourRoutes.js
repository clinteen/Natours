const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require("./../controllers/reviewController");
const reviewRouter = require('./../routes/reviewRoutes');
const bookingRouter = require('./bookingsRoutes');

const router = express.Router();

// This middleware function only runs if the specified parameter is in the route
// router.param("id", tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);
router.use('/:tourId/bookings', bookingRouter);

router
    .route('/top-5-tours')
    .get(tourController.aliasTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
    .route('/monthly-tours/:year')
    .get(
        authController.protect_routes,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyTours
    );

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect_routes,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.resizeUploadImage,
        tourController.updateTourImage,
        tourController.changeFormToJSON,
        tourController.createTour
    );

router
    .route('/:id')
    .get(tourController.getSingleTour)
    .patch(
        authController.protect_routes,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.resizeUploadImage,
        tourController.updateTourImage,
        tourController.changeFormToJSON,
        tourController.updateSingleTour
    )
    .delete(
        authController.protect_routes,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;
