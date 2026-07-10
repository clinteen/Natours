const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

// router.get("/", (req, res) => {
//     res.status(200).render("base", {
//         title: "Go on Adventurous Tours in the Country",
//         tour: "The Forest Hiker",
//         user: "Jonas",
//     });
// });

router.get(
    '/',
    bookingsController.createBookingAuto,
    authController.isUserLoggedIn,
    viewController.getOverview
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

router.get('/admin/tour-update', viewController.updateTourForm);

router.get('/admin/manage-users', viewController.manageUsers);

router.get('/admin/user-update', viewController.updateUserForm);

router.get('/admin/manage-reviews', viewController.manageReviews);

router.get('/admin/review-update', viewController.updateReviewForm);

module.exports = router;
