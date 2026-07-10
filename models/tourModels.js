const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour name must be available'],
            // The second value in the array is the error that will show if the name field is not available
            unique: true,
            trim: true,
            minlength: [10, 'Name length must be equal or greater than 10'],
            maxlength: [40, 'Name length must be equal or less than 40']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour duration must be available']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour group size must be available']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour difficulty must be available'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Values must be either easy, medium or difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Value must be greater than or equal to 1.0'],
            max: [5, 'Value must be less than or equal to 5.0'],
            set: (val) => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'Price is must be available']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    // The this keyword only points to the current document when a new document is created, it does not work on update
                    return value < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'Summary must be available']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'Cover image must be available']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            timestamps: true,
            select: false
        },
        // startDates: [Date],
        startDates: [
            {
                date: Date,
                participants: {
                    type: Number,
                    default: 0
                },
                soldOut: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        SecretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                // default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        // guides: Array,
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ ratingsAverage: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('duration-in-weeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review', // The model to reference
    foreignField: 'tour', // The field in Review that holds the Tour's ID
    localField: '_id' // The field in Tour to match against
});

// DOCUMENT MIDDLEWARE: This is a type of middleware that runs before a function is being saved in the database, it only runs on .save() and .create(), it does not run on the .updateOne() or .updateMany()

tourSchema.pre('save', async function (next) {
    this.slug = slugify(this.name, { lower: true });
    // console.log(next);

    // next();
    // The next() function does not work with my version of mongoose
});

// tourSchema.pre("save", async function (next) {
//     console.log("Hello from the database");
// });

// tourSchema.post("save", async function (doc, next) {
//     console.log(doc);
// });

// EMBEDDING DOCUMENT IN MONGODB

// tourSchema.pre("save", async function () {
//     const guidesPromises = this.guides.map(
//         async (id) => await User.findById(id)
//     );

//     this.guides = await Promise.all(guidesPromises);
// });

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, async function () {
    // if (this.op === "find" || this.op === "findOne") {
    //     this.find({ SecretTour: { $ne: true } });
    // }
    this.find({ SecretTour: { $ne: true } });
    this.start = Date.now();
});

tourSchema.pre(/^find/, async function () {
    this.populate({
        path: 'guides',
        select: '-__v -active'
    });
});

tourSchema.post(/^find/, async function (docs) {
    console.log(
        `The time it took for the data to be saved was ${Date.now() - this.start} milliseconds`
    );
    // console.log(docs);
});

// AGGREGATE MIDDLEWARE

// tourSchema.pre("aggregate", async function () {
//     this.pipeline().unshift({ $match: { difficulty: { $ne: "easy" } } });
//     console.log(this.pipeline());
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
