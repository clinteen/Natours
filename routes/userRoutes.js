const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const bookingRouter = require('./bookingsRoutes');

const router = express.Router();
// console.log('userRoutes.js loaded from:', __filename);

router.use('/:userId/bookings', bookingRouter);

router.post('/signup', authController.userSignUp);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.use(authController.protect_routes);

router.patch('/update-password', authController.updatePassword);

router.patch(
    '/updateMe',
    userController.updateUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.get('/me', userController.getMe, userController.getSingleUser);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(
        userController.updateUserPhoto,
        userController.resizeUserPhoto,
        userController.parseTourBody,
        userController.createUser
    );
router
    .route('/:id')
    .get(userController.getSingleUser)
    .patch(
        userController.updateUserPhoto,
        userController.resizeUserPhoto,
        userController.parseTourBody,
        userController.updateSingleUser
    )
    .delete(userController.deleteSingleUser);

// router.stack.forEach((layer) => {
//     if (layer.route) {
//         console.log(Object.keys(layer.route.methods), layer.route.path);
//     } else if (layer.name) {
//         console.log('MIDDLEWARE:', layer.name);
//     }
// });

module.exports = router;
