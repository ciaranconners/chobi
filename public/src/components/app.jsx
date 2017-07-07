import React from 'react';
import Navbar from './navbar.jsx';
import AlbumDisplay from './albumdisplay.jsx';
import AlbumList from './albumlist.jsx';
import Album from './album.jsx';

/* ------------------------------
Main react App:
  -holds the states
  -holds the methods
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
      selectedAlbum: 'All Photos'
    };
  }

  // getAlbumNames() {
  //   var names = this.state.albums.map(function(album) { return album.name});
  //   this.setState({'albumList', names});
  // }

  setSelectedAlbum(name) {
    this.setState({'selectedAlbum': name});
  }

  getSelectedAlbum() {
    return this.state.selectedAlbum;
  }

  addPhoto(photo, albumName, description, newAlbumName) {

    var data = new FormData();
    data.append('photo', photo, photo.name);

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
        this.setState({albums: response.albums, photos: response.photos});
      }.bind(this),
      error: function(error) {
        console.error('Error in submitting photo upload form: ', error);
      }.bind(this)
    });
  }

  selectAlbum(album, photo) {
    let photoNum = photo || 0;
    this.setState({currentAlbum: album, currentPhoto: photoNum});
  }

  componentDidMount() {
    $.ajax({
      type: 'GET',
      url: '/user/' + this.state.currentUser,
      success: function(data) {
        this.setState({albums: data.albums, currentUser: data, displayUser: data});
        //this.getAlbumNames();
      }.bind(this),
      error: function(err) {
        console.error('error', err);
      }.bind(this)
    });
  }

  renderPage({currentAlbum, albums, selectAlbum, currentPhoto}) { //logic for whether a single album should display or album list
    if (currentAlbum === null) {
      return (
        <AlbumList
          albums={albums}
          selectAlbum={selectAlbum}
        />
      );
    } else {
      return (
        <AlbumDisplay
          currentAlbum={currentAlbum}
          albums={albums}
          selectAlbum={selectAlbum}
          currentPhoto={currentPhoto}
        />
      );
    }
  }

  render() {
    return (
      <div>
        <Navbar addPhoto={this.addPhoto.bind(this)} currentUser={this.state.currentUser} selectAlbum={this.setSelectedAlbum.bind(this)} getAlbum={this.getSelectedAlbum.bind(this)}/>
        <div className="container-fluid">
          <this.renderPage
            currentAlbum={this.state.currentAlbum}
            albums={this.state.albums}
            selectAlbum={this.selectAlbum.bind(this)}
            currentPhoto={this.state.currentPhoto}
          />
        </div>
      </div>
    );
  }
}
