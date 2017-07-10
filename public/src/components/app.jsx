import React from 'react';
import Navbar from './navbar.jsx';
import AlbumDisplay from './albumdisplay.jsx';
import AlbumList from './albumlist.jsx';
import Album from './album.jsx';

/* ------------------------------
Main react App:
  -holds the states
  -holds the methods

_________________________________
Navbar receives:
  - currentUser   as  this.state.currentUser

  - addPhoto      as  this.addPhoto.bind(this)
  - getAlbum      as  this.getSelectedAlbum.bind(this)
  - selectAlbum   as  this.setSelectedAlbum.bind(this)

AlbumList receives:
  - albums        as  albums
  - selectAlbum   as  selectAlbum
  - deleteAlbum   as  deleteAlbum

AlbumDisplay receives:
  - currentAlbum  as  currentAlbum
  - currentPhoto  as  currentPhoto
_________________________________

-------------------------------*/

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      albums: [],
      photos: [],
      currentAlbum: null,
      currentPhoto: 0,
      currentAlbumIndex: 5,
      currentUser: {
        albums: []
      },
      displayUser: {},
      selectedAlbum: 'All Photos',
      featuredFriend: '',
      friends: []
    };
  }

  // ------------------------------------------------------
  //  Navbar stuff

  addPhoto(photo, albumName, description, newAlbumName) {

    var helper = function() {
      $.ajax({
        type: 'GET',
        url: '/user/' + this.state.currentUser,
        success: function(data) {
          this.setState({
            albums: data.albums,
            currentUser: data,
            displayUser: data,
            friends: data.friends
          });
        }.bind(this),
        error: function(err) {
          console.error('error', err);
        }.bind(this)
      });
    };

    var data = new FormData();

    for (let i = 0; i < photo.length; i++) {
      console.log('photo from form: ', photo);
      data.append('photo', photo[i], photo[i].name);
    }
    // data.append('photo', photo, photo.name);

    if(albumName === '__newalbum') {
      if(newAlbumName === '') {
        data.append('albumName', 'All Photos');
      } else {
         data.append('albumName', newAlbumName);
      }
    } else if(albumName === '') {
      data.append('albumName', 'All Photos');
    } else {
      data.append('albumName', albumName);
    }

    data.append('description', description);

    $.ajax({
      type: 'POST',
      url: "/user/upload",
      data: data,
      processData: false,
      contentType: false,
      success: function(response) {
        this.setState({albums: response.albums, photos: response.photos}, helper);
      }.bind(this),
      error: function(error) {
        console.error('Error in submitting photo upload form: ', error);
      }.bind(this)
    });
  }

  setSelectedAlbum(name) {
    this.setState({'selectedAlbum': name});
  }

  addFriend(username) {
    var friends = this.state.currentUser.friends;

    var newFriend = true;

    if (username === this.state.currentUser.username) {
      alert('You can\'t request yourself as a friend');
      newFriend = false;
    }

    friends.forEach(function(friend, i) {
      if (friend.username === username && friend.status === 'pending') {
        alert('You\'ve already requested this person');
        newFriend = false;
      } else if (friend.username === username && friend.status === 'accepted') {
        alert('You\'re already friends with this person');
        newFriend = false;
      } else if (friend.username === username && friend.status === 'denied') {
        //Take a previously denied user out of the friends array before adding them again
        friends.splice(i, 1);
      }
    });
    if (newFriend) {
      friends.push({username: username, status: 'pending', sender: this.state.currentUser.username});

      $.ajax({
        type: 'PUT',
        url: '/user/friends/' + this.state.currentUser.username,
        data: {friends: friends},
        success: function(response) {
          if (response === 'User not found') {
            alert('User not found');
          } else {
            this.setState({friends: response});
          }
        }.bind(this),
        error: function(error) {
          console.error('Error in adding friend', error);
        }.bind(this)
      });
    }
  }

  confirmFriend(friend) {
    var friends = this.state.currentUser.friends;

    friends.forEach(function(userFriend) {
      if (userFriend.username === friend) {
        userFriend.status = 'accepted';
      }
    });

    $.ajax({
      type: 'PUT',
      url: '/user/confirmFriends/' + this.state.currentUser.username,
      data: {addedFriend: friend, friends: friends},
      success: function(response) {
        console.log(response);
        this.setState({friends: response});
      }.bind(this),
      error: function(error) {
        console.error('Error in adding friend', error);
      }.bind(this)
    });
  }

  denyFriend(friend) {
    var friends = this.state.currentUser.friends;

    friends.forEach(function(userFriend, i) {
      if (userFriend.username === friend) {
        userFriend.status = 'denied'; //Check for bug when all friends are deleted
      }
    });


    $.ajax({
      type: 'PUT',
      url: '/user/denyFriends/' + this.state.currentUser.username,
      data: {deniedFriend: friend, friends: friends},
      success: function(response) {
        console.log(response);
        this.setState({friends: response});
      }.bind(this),
      error: function(error) {
        console.error('Error in denying friend', error);
      }.bind(this)
    });
  }

  showAlbums(friend) {
    console.log('friend albums');
    $.ajax({
      type: 'GET',
      url: '/user/showFriendAlbums/' + friend,
      success: function(data) {
        console.log(data);
        this.setState({albums: data, featuredFriend: friend});
        console.log(this.state.featuredFriend);
      }.bind(this),
      error: function(err) {
        console.error('error', err);
      }.bind(this)
    });
  }

  // ------------------------------------------------------
  //  AlbumList stuff

  selectAlbum(album, photo) {
    console.log('fired selectAlbum');
    let photoNum = photo || 0;
    this.setState({currentAlbum: album, currentPhoto: photoNum});
  }

  deleteAlbum(albumIndex) {
     var helper = function() {
       // COMMENT/UNCOMMENT THIS TO MAKE IT ACTUALLY DELETE
       $.ajax({
         type: 'PUT',
         url: '/user/' + this.state.currentUser._id,
         data: {
           albums: this.state.albums
         },
         success: function(data) {
           console.log('success, i think');
           console.log('and some data', data);
           $.ajax({
             type: 'GET',
             url: '/user/' + this.state.currentUser,
             success: function(data) {
              console.log(data);
               this.setState({
                 albums: data.albums,
                 currentUser: data.username
               }, location.reload());
             }.bind(this),
             error: function(err) {
               console.error('error', err);
             }.bind(this)
           });
         }.bind(this),
         error: function(err) {
           console.error('error', err);
         }.bind(this)
       });
     };

    // filters out the album to delete by the index and updates the state
    if (confirm('really?') === true) {
      this.setState({
        albums: this.state.albums.filter((item, index) => index !== albumIndex)
      }, helper); // this needs
    }
  }

  // ------------------------------------------------------
  //  GET request on app re-render (after upload on main page)
  //    could probably add this to the other view to make it
  //    update also

  componentDidMount() {
    $.ajax({
      type: 'GET',
      url: '/user/' + this.state.currentUser,
      success: function(data) {
        this.setState({albums: data.albums, currentUser: data, displayUser: data, friends: data.friends, featuredFriend: ''});
      }.bind(this),
      error: function(err) {
        console.error('error', err);
      }.bind(this)
    });

  }

  // ------------------------------------------------------
  //  logic for whether a single album should display or album list

  renderPage({currentAlbum, albums, selectAlbum, deleteAlbum, currentPhoto, addFriend, featuredFriend}) {
    if (currentAlbum === null) {
      return (
        <div>
        <AlbumList
          albums={albums}
          selectAlbum={selectAlbum}
          deleteAlbum={deleteAlbum}
          featuredFriend={featuredFriend}
        />
        </div>
      );
    } else {
      return (
        <AlbumDisplay
          currentAlbum={currentAlbum}
          currentPhoto={currentPhoto}
        />
      );
    }
  }

  // ------------------------------------------------------

  render() {
    return (
      <div>
        <Navbar
          currentUser={this.state.currentUser}
          addPhoto={this.addPhoto.bind(this)}
          selectAlbum={this.setSelectedAlbum.bind(this)}
          selectedAlbum={this.state.selectedAlbum}
          addFriend={this.addFriend.bind(this)}
          friends={this.state.friends}
          confirmFriend={this.confirmFriend.bind(this)}
          denyFriend={this.denyFriend.bind(this)}
          showAlbums={this.showAlbums.bind(this)}
        />

        <div className="container-fluid">
          <this.renderPage
            currentAlbum={this.state.currentAlbum}
            albums={this.state.albums}
            selectAlbum={this.selectAlbum.bind(this)}
            deleteAlbum={this.deleteAlbum.bind(this)}
            currentPhoto={this.state.currentPhoto}
            featuredFriend={this.state.featuredFriend}
          />
        </div>
      </div>
    );
  }
}
