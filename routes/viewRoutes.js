const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

// router.get("/", (req, res) => {
//     res.status(200).render("base", {
//         title: "Go on Adventourous Tours in the Country",
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

router.get('/me', authController.protect_routes, viewController.getAccountPage);

router.get(
    '/my-tours',
    authController.protect_routes,
    viewController.getMyTours
);

router.post(
    '/submit-user-data',
    authController.protect_routes,
    viewController.submitUserData
);

module.exports = router;
