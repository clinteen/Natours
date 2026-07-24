const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please input your name']
    },
    email: {
        type: String,
        required: [true, 'Please input your email'],
        validate: [validator.isEmail, 'Please enter a valid email'],
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please input your password'],
        minlength: [8, 'Password must be greater than 8 characters'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password'],
        //This only works on create and save, It does not work on findbyIdAndUpdate, because when we use this.password, it is not defined when we update
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Please make sure the passwords are the same'
        }
    },
    changedPasswordDate: Date,
    photo: String,
    passwordResetToken: String,
    passwordTokenExpiresIn: Date,
    active: {
        type: Boolean,
        default: true
    },
    favorites: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour'
        }
    ]
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
});

userSchema.pre('save', async function () {
    if (!this.isModified('password') || this.isNew) return;

    this.changedPasswordDate = Date.now() - 2000;
});

userSchema.pre(/^find/, async function () {
    this.find({ active: { $ne: false } });
});

userSchema.methods.correctPassword = async function (
    password_inputed,
    password_in_database
) {
    const verify_password = await bcrypt.compare(
        password_inputed,
        password_in_database
    );
    return verify_password;
};

userSchema.methods.changedPassword = function (JWTissuedTime) {
    if (this.changedPasswordDate) {
        const DateinMillisec = Number(
            this.changedPasswordDate.getTime() / 1000
        );
        // console.log(JWTissuedTime, DateinMillisec);
        return JWTissuedTime < DateinMillisec;
    }

    return false;
};

userSchema.methods.createPasswordToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordTokenExpiresIn = Date.now() + 10 * 60 * 1000;

    // console.log(resetToken, this.passwordResetToken);

    return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
