const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModels');
// const ApiFeatures = require("./../utils/ApiFeatures");
const asyncCatch = require('./../utils/AsyncCatchError');
const AppError = require('./../utils/AppError');
const factoryController = require('./factoryController');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(
            new AppError(
                'This file is not an image! Please upload an image',
                400
            ),
            true
        );
    } else {
        cb(null, false);
    }
};

const upload = multer({
    multerStorage,
    multerFilter
});

exports.resizeUploadImage = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

// upload.single() (req.file)  Single file
// upload.array('images', 5) (req.files) Multiple files but same field name
// upload.fields([{}]) (req.files) Multiple files with multiple filed name

exports.updateTourImage = asyncCatch(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1.) Image Cover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2.) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
});

exports.aliasTour = (req, res, next) => {
    req.url =
        '/?limit=5&sort=-ratingsAverage,price&fields=name,duration,difficulty,price,ratingsAverage';
    // console.log(req.url);

    // This version works for express version 4 and below because in express version 5, the req.query object getter and setter function overwrites I think: as was told by postman AI
    // req.query.limit = "5";
    // req.query.sort = "-ratingsAverage,price";
    // req.query.fields = "name,duration,difficulty,ratingsAverage,price";

    next();
};

exports.getAllTours = factoryController.getAllDocuments(Tour);
// exports.getAllTours = asyncCatch(async (req, res, next) => {
//     // console.log(req.requestTime);

//     //1a.) Filtering
//     // const queryObj = { ...req.query };
//     // const excludedFields = ["page", "sort", "limit", "fields"];
//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // //1b.) Advanced Filtering

//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(
//     //     /\b(gte|lte|lt|gt)\b/g,
//     //     (match) => `$${match}`
//     // );

//     // let query = Tour.find(JSON.parse(queryStr));

//     //2.) Sorting

//     // if (req.query.sort) {
//     //     let sortBy = req.query.sort.split(",").join(" ");
//     //     query = query.sort(sortBy);
//     // } else {
//     //     query = query.sort("-_id");
//     // }

//     //3.) Field Limiting

//     // if (req.query.fields) {
//     //     let fields = req.query.fields.split(",").join(" ");
//     //     query = query.select(fields);
//     // } else {
//     //     query = query.select("-__v");
//     // }

//     //4.) Pagination
//     // console.log(req.query);
//     // const page = Number(req.query.page) || 1;
//     // const limit = Number(req.query.limit) || 100;
//     // const skip = (page - 1) * limit;

//     // console.log(query.getOptions());
//     // query = query.skip(skip).limit(limit);

//     // const numTours = await Tour.countDocuments();
//     // if (skip >= numTours) {
//     //     throw new Error("This page does not exist");
//     // }

//     // const tours = Tour.find(queryObj)
//     //     .where("duration")
//     //     .equals(5)
//     //     .where("difficulty")
//     //     .equals("easy");

//     const features = new ApiFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//     const tours = await features.query;

//     res.status(200).json({
//         status: "success",
//         requestTime: req.requestTime,
//         length: tours.length,
//         data: {
//             tours: tours,
//         },
//     });
// });

exports.getSingleTour = factoryController.getDocument(Tour, {
    path: 'reviews'
});
// exports.getSingleTour = asyncCatch(async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate("reviews");
//     // Tour.findOne({ _id: req.params.id})

//     if (!tour) {
//         return next(
//             new AppError(
//                 `There is no tour with this '${req.params.id}' ID`,
//                 404
//             )
//         );
//     }

//     res.status(200).json({
//         status: "Success",
//         data: {
//             tour,
//         },
//     });
// });

exports.createTour = factoryController.createDocument(Tour);
// exports.createTour = asyncCatch(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: "success",
//         data: {
//             newTour,
//         },
//     });

//     // try {
//     //     // const newTour = new Tour({
//     //     //     name: 'Your Name',
//     //     //     price: 500
//     //     // });

//     //     const newTour = await Tour.create(req.body);

//     //     res.status(201).json({
//     //         status: "success",
//     //         data: {
//     //             newTour,
//     //         },
//     //     });
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: "failed",
//     //         message: err.message,
//     //     });
//     // }
// });

exports.updateSingleTour = factoryController.updateDocument(Tour);
// exports.updateSingleTour = asyncCatch(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(
//         req.params.id,
//         { $set: req.body },
//         {
//             // new: true, This is no longer working, it is deprecated
//             returnDocument: "after",
//             runValidators: true,
//             lean: true,
//         }
//     );
//     // console.log(tour);

//     if (!tour) {
//         return next(
//             new AppError(
//                 `There is no tour with this '${req.params.id}' ID`,
//                 404
//             )
//         );
//     }

//     res.status(200).json({
//         status: "success",
//         data: {
//             tour,
//         },
//     });
// });

exports.deleteTour = factoryController.deleteDocument(Tour);
// exports.deleteTour = asyncCatch(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(
//             new AppError(
//                 `There is no tour with this '${req.params.id}' ID`,
//                 404
//             )
//         );
//     }

//     res.status(204).json({
//         status: "success",
//         message: null,
//     });
// });

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

// This is for when we haven't learnt about database so we were using the file system
// const fs = require("fs");

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../tours.json`));

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: "failed",
//             message: "Invalid request",
//         });
//     }
//     next();
// };

// exports.checkID = (req, res, next, value) => {
//     if (Number(value) > tours.length) {
//         return res.status(404).json({
//             status: "Failed",
//             message: "Invalid ID",
//         });
//     }
//     next();
// };

// exports.getAllTours = (req, res) => {
//     console.log(req.requestTime);
//     res.status(200).json({
//         status: "success",
//         requestTime: req.requestTime,
//         length: tours.length,
//         data: {
//             tours: tours,
//         },
//     });
// };

// exports.getSingleTour = (req, res) => {
//     console.log(req.params);

//     const id = Number(req.params.id);
//     const tour = tours.find((el) => el.id === id);

//     // if (!tour) {
//     //     return res.status(404).json({
//     //         status: "failed",
//     //         message: "Invalid ID",
//     //     });
//     // }

//     res.status(200).json({
//         status: "success",
//         tour: tour,
//     });
// };

// exports.createTour = (req, res) => {
//     const newId = tours.length + 1;
//     const newTour = Object.assign({ id: newId }, req.body);

//     tours.push(newTour);
//     // console.log('Content-Type', req.headers['content-type']);
//     console.log(req.body);
//     // res.send('ok');

//     // res.status(200).json(newTour);

//     fs.writeFile(
//         `${__dirname.replace("Natours", "")}/tours.json`,
//         JSON.stringify(tours),
//         (err) => {
//             res.status(201).json(newTour);
//         }
//     );
// };

// exports.updateSingleTour = (req, res) => {
//     res.status(200).json({
//         status: "success",
//         data: {
//             tour: "<Updated Tour>",
//         },
//     });
// };

// exports.deleteTour = (req, res) => {
//     res.status(204).json({
//         status: "success",
//         message: null,
//     });
// };
