import React from 'react';
import Album from './album.jsx';

/* ------------------------------
Render the list of albums from the album state in App.jsx
  -calls Album.jsx for each album
-------------------------------*/

// equivalent to:
// const AlbumList = (props) => {...
//   var albums = props.albums;
//   var selectAlbum = props.selectAlbum; ... and so on
const AlbumList = ({albums, selectAlbum, deleteAlbum, featuredFriend}) => {
  if (featuredFriend !== '') {
    return (
    <div>
    <h1>{featuredFriend}'s albums</h1>
    <div>{
      albums.map((album, i) => {
        return (
          <div>
            <Album album={album} selectAlbum={selectAlbum} key={i} />
          </div>
        );
      })
    }</div></div>
    );
  } else {
    return (
      <div>
      <h1>Your albums</h1>
      <div>{
        albums.map((album, i) => {
          return (
            <div>
              <Album album={album} selectAlbum={selectAlbum} key={i} />
              <button onClick={() => { deleteAlbum(i); }}>Delete Album</button>
            </div>
          );
        })
      }</div></div>
    );
  }
};

export default AlbumList;
