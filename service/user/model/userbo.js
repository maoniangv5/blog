var mongoose = require('../../../db/db');

var userSchema = mongoose.Schema({
    'nickname': {
        type: String,
        required: true
    },
    'username': {
        type: String,
        required: true
    },
    'password': {
        type: String,
        required: true
    },
    'phone': {
        type: String,
        required: true
    },
    'email': {
        type: String,
        required: true
    }
}, {
    "timestamps": {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    versionKey: false
});

var user = mongoose.model('users', userSchema);

module.exports = user;