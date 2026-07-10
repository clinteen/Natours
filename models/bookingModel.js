const mongoose = require('mongoose');
const Tour = require('./tourModels');

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
    },
    startDate: {
        type: Date,
        required: [true, 'Please select a start date for the tour']
    }
});

bookingSchema.index({ tour: 1, user: 1 }, { unique: true });

bookingSchema.pre(/^find/, async function () {
    this.populate({
        path: 'user',
        select: 'name email'
    }).populate('tour');
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
