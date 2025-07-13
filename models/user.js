const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  displayName: String,
  bio: String,
  createdAt: { type: Date, default: Date.now }
});

// Must be the last line before export
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);