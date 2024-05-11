const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userAccess: {
        type: Boolean,
        default: false
    }
});

// Create and export User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
