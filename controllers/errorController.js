const AppError = require('./../utils/AppError');

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;

    return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}; Please use another value!`;

    return new AppError(message, 400);
};

const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((value) => value.message);
    const message = `Invalid input data at : ${errors.join(', ')}`;

    return new AppError(message, 400);
};

const handleJWTError = () => {
    return new AppError('Invalid token! Please log in again!', 401);
};

const handleJWTexpiresError = () => {
    return new AppError('Your Token has expired! Please log in again', 401);
};

//DEVELOPMENT
const sendDevError = (err, req, res, next) => {
    // A.) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // B.) RENDERED WEBSITE
    // Send Generic Error
    console.error('ERROR: ', err.message);
    // console.log(err);
    return res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong',
        msg: err.message
    });
};

//PRODUCTION
const sendProdError = (err, req, res, next) => {
    // console.log('err.isOperational:', err.isOperational);
    // console.log('err instanceof AppError:', err instanceof AppError);
    // console.log('err.constructor.name:', err.constructor.name);

    // A.) API
    if (req.originalUrl.startsWith('/api')) {
        // 1.) Operational Error: Send message to Client
        if (err.isOperational === true) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // 2.) Programming Error: Don't Leak error Details
        // Log the error
        console.error('ERROR: ', err);

        // Send Generic Message
        return res.status(500).json({
            status: 'Error',
            message: 'Something went wrong with the server'
        });
    }

    // B.) RENDERED WEBSITE
    if (err.isOperational === true) {
        // 1.) Operational Error: Trusted error, send error message to clients
        // console.log(err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went Wrong',
            msg: err.message
        });
    }
    // 2.) Programming Error: Don't leak error details
    // Log error
    console.error('ERROR: ', err);

    // Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong',
        msg: 'Something Went wrong with the Server! Please try again later'
    });
};

module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, req, res, next);
    } else if (process.env.NODE_ENV === 'production') {
        let my_error = err;
        // my_error.message = err.message;
        // console.log(my_error.isOperational);

        if (my_error.name === 'CastError') my_error = handleCastError(my_error);
        if (my_error.code === 11000) my_error = handleDuplicateFields(my_error);
        if (my_error.name === 'ValidationError')
            my_error = handleValidationError(my_error);
        if (my_error.name === 'JsonWebTokenError') my_error = handleJWTError();
        if (my_error.name === 'TokenExpiredError')
            my_error = handleJWTexpiresError();

        sendProdError(my_error, req, res, next);
        // console.log(err.message);
        // console.log(my_error.message);
    }
};
