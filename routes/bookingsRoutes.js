const express = require('express');

const authController = require('./../controllers/authController');
const bookingsController = require('./../controllers/bookingsController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect_routes);

router.get('/booking-session/:tourId', bookingsController.bookingSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(bookingsController.getAllBookings)
    .post(reviewController.getUserTourId, bookingsController.createBooking);

router
    .route('/:id')
    .get(bookingsController.getSingleBooking)
    .patch(bookingsController.updateBooking)
    .delete(bookingsController.deleteBooking);

module.exports = router;
