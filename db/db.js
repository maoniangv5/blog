var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.DB);

module.exports = mongoose;