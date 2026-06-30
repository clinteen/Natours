const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Please Select a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A User must be available']
    },
    price: {
        type: Number,
        required: [true, 'A Price must be available']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, async function () {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
