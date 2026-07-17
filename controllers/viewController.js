const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/AsyncCatchError');
const AppError = require('../utils/AppError');

const manageResources = (Model, title, pug_file, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        const page = Number(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        let query = Model.find().limit(limit).skip(skip);

        if (populateOptions) query = query.populate(populateOptions);

        const documents = await query;
        console.log(documents.length);
        const totalDocuments = await Model.countDocuments();

        res.status(200).render(pug_file, {
            title: title,
            documents: documents,
            currentPage: page,
            totalPages: Math.ceil(totalDocuments / limit)
        });
    });
};

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
    // console.log(req.user.id);

    if (!tour) {
        return next(new AppError('There is no tour with this Name!', 404));
    }

    if (!req.user) {
        return res.status(200).render('tour', {
            title: tour.name,
            tour: tour
        });
    }

    const hasUserBookedTour = await Booking.findOne({
        tour: tour._id,
        user: req.user._id
    });

    if (hasUserBookedTour) {
        console.log(hasUserBookedTour);
        res.locals.bookedTour = true;
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

exports.getSignUpPage = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up Your Account'
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

exports.getMyReviews = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const reviews = await Review.find({ user: user._id }).populate('tour');

    res.status(200).render('user_reviews', {
        title: 'My Reviews',
        reviews: reviews
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

exports.manageTours = manageResources(
    Tour,
    'Manage Tours for Admin',
    'tours_admin'
);

exports.createNewTour = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).render('tours_admin_create', {
        title: 'Create Tour',
        users: users
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tourGuides = await Tour.findById(req.params.id);
    console.log(tourGuides);

    res.status(200).render('tours_admin_create', {
        title: 'Update Tour',
        tourGuides
    });
});

exports.createNewUser = catchAsync(async (req, res, next) => {
    res.status(200).render('user_admin_create', {
        title: 'Create User'
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const userBeingUpdated = await User.findById(req.params.id);

    res.status(200).render('user_admin_create', {
        title: 'Update User',
        userBeingUpdated
    });
});

exports.manageUsers = manageResources(
    User,
    'Manage Users for Admin',
    'users_admin'
);

exports.manageReviews = manageResources(
    Review,
    'Manage Reviews for Admin',
    'reviews_admin',
    'tour'
);

exports.createNewReview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    const users = await User.find();

    res.status(200).render('reviews_admin_create', {
        title: 'Create Review',
        tours,
        users
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const review = await Review.findById(userId);
    // console.log(review);

    res.status(200).render('reviews_admin_create', {
        title: 'Update Review',
        review
    });
});

exports.manageBookings = manageResources(
    Booking,
    'Manage Bookings for Admin',
    'bookings_admin',
    ['tour', 'user']
);

exports.createNewBooking = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    const users = await User.find();

    res.status(200).render('bookings_admin_create', {
        title: 'Create Booking',
        tours,
        users
    });
});

exports.updateBooking = catchAsync(async (req, res, next) => {
    const bookingBeingUpdated = await Booking.findById(req.params.id);

    res.status(200).render('bookings_admin_create', {
        title: 'Update Booking',
        bookingBeingUpdated
    });
});
