const User = require('../db/models/user.js');
const multer = require('multer');
const cloudinaryApi = require('./cloudinaryApi.js');
const _ = require('underscore');
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
const Promise = require('bluebird');
const asyncEach = require('async/each');

// Parses multi-part data from form - used to extract image data
const upload = multer().array('photo', 10); // 'photo' indicates the name attribute on the multpart/form element (they must be the same)
const requestHandler = {};

// Unused - For private multi-user sharing (not yet implemented)
const showAccessibleAlbums = function (currentUsername, albums) {
  // filters by albums the currentUsername has access to (access property in Schema)
  return _.filter(albums, album => {
    return album.access.includes(currentUsername);
  });
};

// Sends User object to frontend - contains all info (albums, etc.)
requestHandler.getUser = function (req, res) {
  // Logged in user:
  const currentUsername = req.session.username;
  // if the user is trying to view a different user's albums, pull from req.body; else pull from session
  const queryUsername = req.body.username || currentUsername;

  if (currentUsername === queryUsername) {
    User.findOne({ username: req.session.username }, { password: 0 }, (error, user) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.json(user);
      }
    });
  } else {
    User.findOne({ username: queryUsername }, { password: 0, friends: 0, email: 0 }, (error, user) => { // eslint-disable-line
      if (error) {
        res.status(500).send(error);
      } else {
        res.json(user.albums);
      }
    });
  }
};

requestHandler.showFriendAlbums = function (req, res) {
  //console.log(req.params.username);

  const queryUsername = req.params.username;

  User.findOne({ username: queryUsername }, { password: 0, friends: 0, email: 0 }, (error, user) => { // eslint-disable-line
    if (error) {
      res.status(500).send(error);
    } else {
      res.json(user.albums);
    }
  });

};

requestHandler.updateUser = function(req, res) {
  var currentUsername = req.session.username;
  var id = req.params.id;
  var albums = req.body.albums;

  User.findByIdAndUpdate({_id: id}, {albums: albums}, {new: true})
  .then(function(updatedUserData) {
    console.log(updatedUserData);
    res.json(updatedUserData);
  });
};

requestHandler.friendUser = function(req, res) {
  var initiator = req.session.username;
  var receiver = req.body.friends[req.body.friends.length - 1].username;

  User.findOne({username: receiver}).then(function(receiver) {
    if (receiver === null || receiver.length === 0) {
      res.send('User not found');
    } else {
      receiver.friends.forEach(function(friend, i) {
        if (friend.username === initiator && friend.status === 'denied') {
          //Take a previously denied user out of the friends array before adding them again
          receiver.friends.splice(i, 1);
        }
      });
      receiver.friends.push({username: initiator, status: 'pending', sender: initiator});
      User.findOneAndUpdate({username: receiver.username}, {friends: receiver.friends}, {new: true}).then(function(oldUser){
        // console.log("receiver ", oldUser)
        User.findOneAndUpdate({username: initiator}, {friends: req.body.friends}, {new: true}).then(function(oldUser){
          // console.log("initiator ", oldUser)
          res.send(oldUser.friends);
          });
        });
      }
    });
  };


requestHandler.confirmFriend = function(req, res) {
  var initiator = req.session.username;
  console.log('====================', req.body);
  var receiver = req.body.addedFriend;

  User.findOne({username: receiver}, function(err, foundReceiver) {
    if (err) {
      res.status(500).send('There was an error with finding the request recipient ', err);
    } else {
      foundReceiver.friends.forEach(function(friend) {
        if (friend.username === initiator) {
          friend.status = 'accepted';
        }
      });
      User.findOneAndUpdate({username: foundReceiver.username}, {friends: foundReceiver.friends}, {new: true}, function(err, returnedReceiver) {
        if (err) {
          res.status(500).send('There was an error with updating the request recipient ', err);
        } else {
          User.findOneAndUpdate({username: initiator}, {friends: req.body.friends}, {new: true}, function(err, initiator) {
            if (err) {
              res.status(500).send('There was an error with updating the request initiator', err);
            } else {
              res.send(initiator.friends);
            }
          });
        }
      });
    }
  });
}

requestHandler.denyFriend = function(req, res) {
    var initiator = req.session.username;
    var receiver = req.body.deniedFriend;

    User.findOne({username: receiver}, function(err, foundReceiver) {
      if (err) {
        res.status(500).send('There was an error with finding the request recipient ', err);
      } else {
        foundReceiver.friends.forEach(function(friend) {
          if (friend.username === initiator) {
            friend.status = 'denied';
          }
        });
        User.findOneAndUpdate({username: foundReceiver.username}, {friends: foundReceiver.friends}, {new: true}, function(err, returnedReceiver) {
          if (err) {
            res.status(500).send('There was an error with updating the request recipient ', err);
          } else {
            User.findOneAndUpdate({username: initiator}, {friends: req.body.friends}, {new: true}, function(err, initiator) {
              if (err) {
                res.status(500).send('There was an error with updating the request initiator', err);
              } else {
                res.send(initiator.friends);
              }
            });
          }
        });
      }
    });
  }

requestHandler.handleUploadPhoto = (req, res) => {
  // function from multer - used to parse multi-part form data
  upload(req, res, err => {
      if (err) {
        // An error occurred when uploading
        res.status(500).send(err);
        return;
      }
      // console.log(req.files); => coming through correctly
      var buffers = [];
      for (let x of req.files) {
        buffers.push(x.buffer);
      }
      console.log(buffers); //=> coming through correctly for 1 and 2 but not more files
      // .uploadPhotoBuffer from Cloudinary - req.file.buffer from multer

      var cloudinaryCall = function(buffer, callback) {
        cloudinaryApi.uploadPhotoBuffer(buffer, result => {
          const photo = {
            description: req.body.description,
            url: result.url, // result returned from Cloudinary API (url of photo)
          };

          const album = {
            name: req.body.albumName,
            photos: [
              photo,
            ],
          };

          // Find the user and add the uploaded photo
          User.findOne({
              username: req.session.username
            },
            (error, user) => {
              let allPhotosIndex;
              let foundAlbumIndex;
              if (!error) {
                // find index of All Photos album
                allPhotosIndex = _.findIndex(user.albums, foundAlbum => {
                  return foundAlbum.name === 'All Photos';
                });
                // check if 'All Photos' album exists
                if (allPhotosIndex > -1) {
                  // add every photo that gets uploaded to the All Photos album
                  user.albums[allPhotosIndex].photos.push(photo);
                  // else, ('All Photos' album doesn't exist) create it
                } else {
                  const allPhotosAlbum = {
                    name: 'All Photos',
                    photos: [
                      photo,
                    ],
                  };
                  // and add it to user's albums
                  user.albums.push(allPhotosAlbum);
                }
                // if the user specified a different album...
                if (req.body.albumName !== 'All Photos') {
                  // check if album already exists by finding its index
                  foundAlbumIndex = _.findIndex(user.albums, foundAlbum => {
                    return foundAlbum.name === req.body.albumName;
                  });
                  // if album exists...
                  if (foundAlbumIndex > -1) {
                    // add the uploaded photo to that album
                    user.albums[foundAlbumIndex].photos.push(photo);
                    // else, add the album to the user's album list
                  } else {
                    user.albums.push(album);
                  }
                }
                // save updated user and send back to client
                user.save((err, savedUser) => { // eslint-disable-line
                  //res.status(200).json(savedUser);
                  console.log('user saved');
                  callback();
                });
              } else {
                res.status(500).json(err);
              }
            } // eslint-disable-line
          );
        });
      };
      asyncEach(buffers, cloudinaryCall, function() {
        console.log('success: photographs saved to cloud');
        User.findOne({username: req.session.username}, function(err, user) {
          console.log('sending back updated user with fresh photos');
          res.status(200).json(user);
        });
      });
    });
};

































// requestHandler.handleUploadPhoto = (req, res) => {
//   // function from multer - used to parse multi-part form data
//   upload(req, res, err => {
//     if (err) {
//       // An error occurred when uploading
//       res.status(500).send(err);
//       return;
//     }
//     console.log(req); // at this point we have the req and just need to send the files

//     var arrOfPhotosAndWhatever = [];

//     let album;

//     // .uploadPhotoBuffer from Cloudinary - req.file.buffer from multer
//     var chobiCallback = function (result) {
//       const photo = {
//         description: req.body.description,
//         url: result.url, // result returned from Cloudinary API (url of photo)
//       };

//       arrOfPhotosAndWhatever.push(photo);

//       album = {
//         name: req.body.albumName,
//         photos: [
//           photo,
//         ],
//       };
//     }

//     //cloudinaryApi.uploadPhotoBuffer(req.file.buffer, chobiCallback); // <- make these (req.body.files.length) times

//     var tasks = [];
//     for (let i = 0; i < req.files.length; i++) {
//       tasks.push(cloudinaryApi.uploadPhotoBuffer.bind(this, req.files[i].buffer, chobiCallback));
//     }

//     var asyncMap = function(tasks, callback) {
//       var result = [];
//       var counter = 0;
//       for (let i = 0; i < tasks.length; i++) {
//         (function(i) {
//           tasks[i](function(val) {
//             result[i] = val;
//             counter++;
//             if (counter === tasks.length) {
//               callback(result);
//             }
//           });
//         })(i);
//       }
//     };

//     asyncMap(tasks, function() {
//       console.log('done performing all tasks');
//       // Find the user and add the uploaded photo
//       User.findOne(
//         { username: req.session.username },
//         (error, user) => {
//           let allPhotosIndex;
//           let foundAlbumIndex;
//           if (!error) {
//             // find index of All Photos album
//             allPhotosIndex = _.findIndex(user.albums, foundAlbum => {
//               return foundAlbum.name === 'All Photos';
//             });
//             // check if 'All Photos' album exists
//             if (allPhotosIndex > -1) {
//               // add every photo that gets uploaded to the All Photos album
//               arrOfPhotosAndWhatever.forEach(function(photo) {
//                 user.albums[allPhotosIndex].photos.push(photo);
//               });
//             // else, ('All Photos' album doesn't exist) create it
//             } else {
//               const allPhotosAlbum = {
//                 name: 'All Photos',
//                 photos: [
//                   photo,
//                 ],
//               };
//               // and add it to user's albums
//               user.albums.push(allPhotosAlbum);
//             }
//             // if the user specified a different album...
//             if (req.body.albumName !== 'All Photos') {
//               // check if album already exists by finding its index
//               foundAlbumIndex = _.findIndex(user.albums, foundAlbum => {
//                 return foundAlbum.name === req.body.albumName;
//               });
//               // if album exists...
//               if (foundAlbumIndex > -1) {
//                 // add the uploaded photo to that album
//                 arrOfPhotosAndWhatever.forEach(function(photo) {
//                   user.albums[foundAlbumIndex].photos.push(photo);
//                 });
//               // else, add the album to the user's album list
//               } else {
//                 user.albums.push(album);
//               }
//             }
//             // save updated user and send back to client
//             user.save((err, savedUser) => { // eslint-disable-line
//               res.status(200).json(savedUser);
//             });
//           } else {
//             res.status(500).json(err);
//           }
//         } // eslint-disable-line
//       );
//     });

//   });
// };

// Authentication methods

requestHandler.sendSignup = function (req, res) {
  res.sendFile(path.join(__dirname, '../../public/signup.html'));
};

requestHandler.sendLogin = function (req, res) {
  res.sendFile(path.join(__dirname, '../../public/login.html'));
};


function createUser(user, req, res) {
  const cipher = Promise.promisify(bcrypt.hash);
  if (!user.profilePic) {
    // default avatar if one wasn't provided
    user.profilePic = 'http://www.lovemarks.com/wp-content/uploads/profile-avatars/default-avatar-tech-guy.png';
  }
  // hash newly created user's password
  cipher(user.password, null, null)
    .then(function (hash) {
      user.password = hash;
      User.create(
        user,
        (error, user) => {// eslint-disable-line
          if (error) {
            res.status(500).redirect('/signup');
          } else {
            req.session.regenerate(() => {
              // pull username from request to identify the current user
              req.session.username = req.body.username;
              res.redirect('/');
            });
          }
        } // eslint-disable-line
      );
    });
}

requestHandler.handleSignup = function (req, res) {
  upload(req, res, () => {
    const user = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      profilePic: '',
      albums: [],
    };
    // checks if a profilePic was uploaded
    if (req.file && req.file.buffer) {
      // if so, upload it
      cloudinaryApi.uploadPhotoBuffer(req.file.buffer, result => {
        user.profilePic = result.url;
        createUser(user, req, res);
      });
    } else {
      createUser(user, req, res);
    }
  });
};

requestHandler.handleLogin = function (req, res) {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (user) {
      User.comparePassword(req.body.password, user.password, (err, isAuthenticated) => {
        if (isAuthenticated) {
          req.session.regenerate(() => {
            req.session.username = req.body.username;
            res.redirect('/');
          });
        } else {
          res.redirect('/auth/login');
        }
      });
    } else {
      res.redirect('/auth/signup');
    }
  });
};

requestHandler.handleLogout = function (req, res) {
  req.session.destroy(err => {
    if (err) {
      res.status(500);
    } else {
      res.redirect('/auth/login');
    }
  });
};

module.exports = requestHandler;
