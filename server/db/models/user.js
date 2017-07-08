const mongoose = require('../config.js');
const bcrypt = require('bcrypt-nodejs');
const Promise = require('bluebird');

const Schema = mongoose.Schema;


// photoSchema and albumSchema added to make querying nested arrays easier
const photoSchema = new Schema({
  description: String,
  url: String,
});

const albumSchema = new Schema({
  access: [], //changed this from array to boolean
  photos: [photoSchema],
  name: String,
});

const userSchema = new Schema({
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  profilePic: String,
  albums: [albumSchema],
  friends: [], // {username: patrick, status: pending / accepted, sender: chobi}
});

const User = mongoose.model('User', userSchema);

// helper function for authentication
User.comparePassword = function (candidatePassword, savedPassword, cb) {
  bcrypt.compare(candidatePassword, savedPassword, (err, isMatch) => { // eslint-disable-line
    if (err) { return cb(err); }
    cb(null, isMatch);
  });
};


// WARNING: Below code drops the database; only uncomment and run if you absolutely need to

// if (process.env.NODE_ENV !== 'production') {
//   const testUser = {
//     firstName: 'John',
//     lastName: 'Doe',
//     username: 'john_doe',
//     password: 'john123',
//     email: 'john@doe.com',
//     // albums: [{ photos: [], name: 'All Photos' }]
//     albums: [],
//   };

//   User.remove({}, function(err, user){
//     console.log('table dropped');
//   });

//   User.create(testUser);
// }

module.exports = User;
