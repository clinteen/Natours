const crypto = require('crypto');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/AsyncCatchError');
const AppError = require('./../utils/AppError');
const Email = require('./../utils/email');

const signJWT = (id) => {
    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    });
    return token;
};

const sendToken = (user, statusCode, res) => {
    const token = signJWT(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() +
                process.env.JWT_COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
};

exports.userSignUp = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        changedPasswordDate: req.body.changedPasswordDate,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    // await new Email(newUser, url).sendWelcome();

    sendToken(newUser, 201, res);

    // const token = signJWT(newUser._id);
    // res.status(201).json({
    //     status: "success",
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });
});

exports.login = catchAsync(async (req, res, next) => {
    // console.log('LOGIN HANDLER HIT');
    //1.) Check if the user imputed the name and password
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please enter your email and password'), 400);
    }

    //2.) Check if the user exists and the password is correct
    const user = await User.findOne({ email: email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email or Password are not correct'), 401);
    }

    //3.) If everything is okay

    sendToken(user, 200, res);
    // const token = signJWT(user._id);
    // res.status(200).json({
    //     status: "success",
    //     token,
    // });
});

exports.protect_routes = catchAsync(async (req, res, next) => {
    console.log('PROTECT ROUTES HIT', req.originalUrl);
    //1.) Check if the user has a token
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        );
    }

    //2.) Verify the user token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3.) Check if the user still exist in the database
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist',
                401
            )
        );
    }

    //4.) Check if the user has changed passwords and still using the old token issued when using the old password

    if (currentUser.changedPassword(decoded.iat)) {
        return next(
            new AppError(
                'The user has changed password! Please log in again',
                401
            )
        );
    }

    // Grant User access to Protected Routes
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.isUserLoggedIn = async (req, res, next) => {
    //1.) Check if the user has a token and verify it if the user has a token
    if (req.cookies.jwt) {
        try {
            //2.) Verify the user token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //3.) Check if the user still exist in the database
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
                return next();
            }

            //4.) Check if the user has changed passwords and still using the old token issued when using the old password
            if (currentUser.changedPassword(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            req.user = currentUser;
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.logOut = (req, res) => {
    res.cookie('jwt', 'Logged Out!', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success' });
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1.) Check if the user still exists in the database
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(
            new AppError('There is no user with this email address', 404)
        );
    }

    //2.) Generate a random token for the user (encrypted)

    const resetToken = user.createPasswordToken();
    await user.save({ validateBeforeSave: false });

    //3.) Send the token to the user email

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${URL}.\nIf you didn't forget your password, please ignore this mail`;

    try {
        const URL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;

        await new Email(user, URL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordTokenExpiresIn = undefined;

        await user.save({ validateBeforeSave: false });

        return next(
            err
            // new AppError(
            //     "There was an error sending the email, Please try again later!",
            //     500
            // )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1.) Get the user based on the token provided
    const userToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //2.) If the token has not expired and if the user exists, set the new password

    const user = await User.findOne({
        passwordResetToken: userToken,
        passwordTokenExpiresIn: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Token has expired or was never sent', 400));
    }
    //3.) Update the changedPasswordDate

    //4.) Log the user in, Basically send the user a JWT

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordTokenExpiresIn = undefined;

    await user.save();

    sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1.) Get user from the database

    const user = await User.findOne({ _id: req.user.id }).select('+password');
    // console.log(user);

    //2.) Check if the user imputed the correct password

    const verify_password = await user.correctPassword(
        req.body.oldpassword,
        user.password
    );
    if (!verify_password) {
        return next(new AppError('The imputed password is incorrect', 401));
    }

    //3.) If so update the user password in the database

    user.password = req.body.newpassword;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //4.) Log the user in and send a new JWT

    sendToken(user, 200, res);
});
