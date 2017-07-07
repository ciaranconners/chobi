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
const AlbumList = ({albums, selectAlbum, deleteAlbum}) => {
  return (
    <div>{
      albums.map((album, i) => {
        return (
          <div>
            <Album album={album} selectAlbum={selectAlbum} key={i} />
            <button onClick={() => { deleteAlbum(i); }}>Delete Album</button>
          </div>
        );
      })
    }</div>
  );
};

export default AlbumList;
