const mongoose = require("mongoose");


const autoIncrement = require('mongoose-auto-increment');
const { connection } = require('../../db.js');
autoIncrement.initialize(connection);

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    gender: String,
    isActive: { type: String, default: "true" },
    token: String,
  
}
);





userSchema.plugin(autoIncrement.plugin, 'User');
const User = mongoose.model('User', userSchema);

module.exports = {User: User}

