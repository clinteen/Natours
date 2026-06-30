const catchAsync = require("./../utils/AsyncCatchError");
const ReviewModel = require("./../models/reviewModel");
const factoryController = require("./factoryController");

exports.getAllReviews = factoryController.getAllDocuments(ReviewModel);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filteredId = {};
//     if (req.params.tourId) {
//         filteredId = { tour: req.params.tourId };
//     }

//     const reviews = await ReviewModel.find(filteredId);

//     res.status(200).json({
//         status: "success",
//         length: reviews.length,
//         data: reviews,
//     });
// });

exports.getUserTourId = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
});

exports.getSingleReview = factoryController.getDocument(ReviewModel);
exports.createReview = factoryController.createDocument(ReviewModel);
exports.updateReview = factoryController.updateDocument(ReviewModel);
exports.deleteReview = factoryController.deleteDocument(ReviewModel);
