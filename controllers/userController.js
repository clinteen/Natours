const multer = require('multer');
const sharp = require('sharp');
const asyncCatch = require('./../utils/AsyncCatchError');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');
const factoryController = require('./factoryController');
const tourController = require('./tourController');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image')) {
        cb(
            new AppError(
                'The file is not an image! Please upload an image',
                400
            ),
            false
        );
    } else {
        cb(null, true);
    }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.updateUserPhoto = upload.single('photo');

exports.resizeUserPhoto = asyncCatch(async (req, res, next) => {
    if (!req.file) {
        delete req.body.photo;

        return next();
    }

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    req.body.photo = req.file.filename;

    next();
});

const filteredObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.updateMe = asyncCatch(async (req, res, next) => {
    //1.) Make sure the user does not try to update password
    if (req.body.password || req.body.confirmPassword) {
        return next(
            new AppError(
                'This route is not for updating password! Please go to /reset-password',
                400
            )
        );
    }

    //2.) Update the user document
    console.log(req.user.id);
    const filteredBody = filteredObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            returnDocument: 'after',
            runValidators: true,
            lean: true
        }
    );

    //3.) Send the updated document to the User
    res.status(200).json({
        status: 'success',
        user: updatedUser
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;

    next();
};

exports.deleteMe = asyncCatch(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        { _id: req.user.id },
        { active: false }
    );

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllUsers = factoryController.getAllDocuments(User);

exports.getSingleUser = factoryController.getDocument(User);

exports.updateSingleUser = factoryController.updateDocument(User);

exports.parseTourBody = (req, res, next) => {
    tourController.parseTourBody(
        'nothing',
        req.body,
        'role',
        'active',
        'photo'
    );

    next();
};

exports.createUser = factoryController.createDocument(User);

exports.deleteSingleUser = factoryController.deleteDocument(User);

exports.addFavourites = asyncCatch(async (req, res, next) => {
    const tourId = req.params.tourId;
    const user = req.user;

    const favorites = user.favorites.map((id) => id.toString());

    if (favorites.includes(tourId)) {
        user.favorites.pull(tourId);
    } else {
        user.favorites.push(tourId);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            favorites: user.favorites
        }
    });
});
