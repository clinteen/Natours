const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

router.get(
    '/',
    // bookingsController.createBookingAuto,
    authController.isUserLoggedIn,
    viewController.getOverview
);

router.get(
    '/my-favourites',
    authController.protect_routes,
    viewController.getFavouritesPage
);

router.get('/tour', authController.isUserLoggedIn, viewController.getTour);

router.get(
    '/tours/:tourSlug',
    authController.isUserLoggedIn,
    viewController.getTourBySlug
);

router.get(
    '/login',
    authController.isUserLoggedIn,
    viewController.getLoginPage
);

router.get('/tour-guides', viewController.getGuides);

router.get('/sign-up', viewController.getSignUpPage);

router.get('/me', authController.protect_routes, viewController.getAccountPage);

router.get(
    '/my-tours',
    authController.protect_routes,
    viewController.getMyTours
);

router.get(
    '/my-reviews',
    authController.protect_routes,
    viewController.getMyReviews
);

router.post(
    '/submit-user-data',
    authController.protect_routes,
    viewController.submitUserData
);

router.use(
    '/admin',
    authController.protect_routes,
    authController.restrictTo('admin', 'tour-guide')
);

router.get('/admin/manage-tours', viewController.manageTours);
router.get('/admin/tour-update', viewController.createNewTour);
router.get('/admin/tour-update/:id', viewController.updateTour);

router.get('/admin/manage-users', viewController.manageUsers);
router.get('/admin/user-update', viewController.createNewUser);
router.get('/admin/user-update/:id', viewController.updateUser);

router.get('/admin/manage-reviews', viewController.manageReviews);
router.get('/admin/review-update', viewController.createNewReview);
router.get('/admin/review-update/:id', viewController.updateReview);

router.get('/admin/manage-bookings', viewController.manageBookings);
router.get('/admin/booking-update', viewController.createNewBooking);
router.get('/admin/booking-update/:id', viewController.updateBooking);

module.exports = router;
