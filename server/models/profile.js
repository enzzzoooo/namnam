// profileModel.js

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['user', 'owner'],
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // Assuming the password will be stored as a hash
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    displayPhotoUrl: {
        type: String, // Assuming the profile picture will be stored as a file path or URL
        required: true,
    }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
