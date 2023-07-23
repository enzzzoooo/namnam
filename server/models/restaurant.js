// restaurantModel.js

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    picture: {
        type: String // Assuming the restaurant picture will be stored as a file path or URL
    }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
