const catchAsync = require('./../utils/AsyncCatchError');
const ApiFeatures = require('./../utils/ApiFeatures');
const AppError = require('./../utils/AppError');

exports.createDocument = (Model) => {
    return catchAsync(async (req, res, next) => {
        // console.log('Received');
        // console.log(req.body);
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    });
};

exports.updateDocument = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {
                // new: true, This is no longer working, it is deprecated
                returnDocument: 'after',
                runValidators: true,
                lean: true
            }
        );
        // console.log(tour);

        if (!doc) {
            return next(
                new AppError(
                    `There is no document with this '${req.params.id}' ID`,
                    404
                )
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc
            }
        });
    });
};

exports.deleteDocument = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(
                new AppError(
                    `There is no document with this '${req.params.id}' ID`,
                    404
                )
            );
        }

        res.status(204).json({
            status: 'success',
            message: null
        });
    });
};

exports.getDocument = (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate(populateOptions);
        const doc = await query;

        if (!doc) {
            return next(
                new AppError(
                    `There is no document with this '${req.params.id}' ID`,
                    404
                )
            );
        }

        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        });
    });
};

exports.getAllDocuments = (Model) => {
    return catchAsync(async (req, res, next) => {
        //Please this is an exception for reviewController when we were learning
        let filteredId = {};
        if (req.params.tourId) {
            filteredId = { tour: req.params.tourId };
        }
        if (req.params.userId) {
            filteredId = { user: req.params.userId };
        }
        const features = new ApiFeatures(Model.find(filteredId), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        // const doc = await features.query.explain();
        const doc = await features.query;

        res.status(200).json({
            status: 'success',
            requestTime: req.requestTime,
            length: doc.length,
            data: {
                documents: doc
            }
        });
    });
};
