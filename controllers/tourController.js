const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModels');
// const ApiFeatures = require("./../utils/ApiFeatures");
const asyncCatch = require('./../utils/AsyncCatchError');
const AppError = require('./../utils/AppError');
const factoryController = require('./factoryController');

exports.parseTourBody = (type, obj, ...lists) => {
    lists.forEach((list) => {
        const val = obj[list];

        if (!val || val === '' || val === '[]' || val === '{}') {
            delete obj[list];
            return;
        }

        if (typeof val === 'string') {
            if (type === 'object') {
                obj[list] = JSON.parse(val);
            } else if (type === 'number') {
                obj[list] = Number(val);
            } else if (type === 'boolean') {
                obj[list] = val === 'true';
            }
        }
    });
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(
            new AppError(
                'This file is not an image! Please upload an image',
                400
            ),
            false
        );
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.changeFormToJSON = asyncCatch(async (req, res, next) => {
    exports.parseTourBody(
        'object',
        req.body,
        'startDates',
        'startLocation',
        'locations',
        'guides'
    );
    exports.parseTourBody(
        'number',
        req.body,
        'duration',
        'maxGroupSize',
        'price',
        'priceDiscount'
    );
    exports.parseTourBody('boolean', req.body, 'SecretTour');

    console.log(req.body);
    next();
});

exports.updateTourImage = asyncCatch(async (req, res, next) => {
    // 1. If no files uploaded, just continue - don't return
    if (!req.files) return next();

    const tourId = req.params.id || req.user.name;

    // 2.) Image Cover - check separately
    if (req.files.imageCover) {
        req.body.imageCover = `tour-${tourId}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${req.body.imageCover}`);
    }

    // 3.) Images - check separately
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/tours/${filename}`);
                req.body.images.push(filename);
            })
        );
    }

    next();
});

exports.resizeUploadImage = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

exports.aliasTour = (req, res, next) => {
    req.url =
        '/?limit=5&sort=-ratingsAverage,price&fields=name,duration,difficulty,price,ratingsAverage';

    next();
};

exports.getAllTours = factoryController.getAllDocuments(Tour);

exports.getSingleTour = factoryController.getDocument(Tour, {
    path: 'reviews'
});

exports.createTour = factoryController.createDocument(Tour);

exports.updateSingleTour = factoryController.updateDocument(Tour);

exports.deleteTour = factoryController.deleteDocument(Tour);

exports.getTourStats = asyncCatch(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: "EASY" } },
        // },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

exports.getMonthlyTours = asyncCatch(async (req, res, next) => {
    const year = req.params.year;
    const tours = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $limit: 20
        }
    ]);

    res.status(200).json({
        status: 'success',
        length: tours.length,
        data: {
            tours
        }
    });
});

exports.getToursWithin = asyncCatch(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours
    });
});

exports.getDistances = asyncCatch(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        return next(
            new AppError(
                'Please provide latitude and longitude in the format lat,lng',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            // This geoNear option must be the first option when we are calculating for geospatial data
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [Number(lng), Number(lat)]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: distances
    });
});
