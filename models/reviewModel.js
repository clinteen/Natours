const mongoose = require('mongoose');
const Tour = require('./tourModels');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Please input your review']
        },
        rating: {
            type: Number,
            min: [1, 'Review cannot be lower than 1'],
            max: [5, 'Review cannot be higher than 5'],
            required: [true, 'Please input your review']
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a Tour']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a User']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    },
    { autoIndex: true }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAvgRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                avgRating: { $avg: '$rating' },
                numOfRating: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].numOfRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        });
    }
};

reviewSchema.post('save', async function () {
    this.constructor.calcAvgRatings(this.tour);
});

// Jonas used this in his course because he wanted to get access to the current document but we achieved this by passing the doc parameter to the post hook
// reviewSchema.pre(/^findOneAnd/, async function () {
//     // The this keyword in the query middleware is referring to the Query Object
//     this.r = await this.findOne();
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
    // console.log(doc);
    //doc.contructor.calcAvgRatings(doc.tour) | This does not work because the lean property is set to true when we update
    this.model.calcAvgRatings(doc.tour);
});

reviewSchema.pre(/^find/, async function () {
    // this.populate({
    //     path: "tour",
    //     select: "name",
    // }).populate({
    //     path: "user",
    //     select: "name photo",
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
