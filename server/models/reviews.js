// reviewModel.js

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    starRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true
    },
    reviewPhotoUrl: {
        type: String // Assuming the media will be stored as a file path or URL
    },
    helpfulCount: {
        type: Number,
        default: 0,
        required: true
    },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
