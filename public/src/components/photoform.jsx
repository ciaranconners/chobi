import React from 'react';

/* ------------------------------
Render Photo upload form to dropdown in navbar:
  -call upon addPhoto method from App.jsx
-------------------------------*/

const PhotoForm = ({addPhoto, currentUser, selectAlbum, getAlbum, selectedAlbum}) => {
  let photo;
  let name = selectedAlbum;
  let desc;
  let newName;
  let albums;

  if(currentUser.albums.length) {
    albums = currentUser.albums.map((album) => {
      return <option value={album.name}>{album.name}</option>
    });
  } else {
    albums = <option value="All Photos">All Photos</option>;
  }

  $('select#name').on('change', function(e) {
    e.preventDefault();
    selectAlbum($(this).val());
    if($(this).val() === '__newalbum') {
      $('.new-name-hidden').show();
    } else {
      $('.new-name-hidden').hide();
    }
  });

  return (
    <form method="post" encType="multpart/form-data" onSubmit={(e) => {
      e.preventDefault();
      selectAlbum(newName.value);
      // albums.push(newName.value);
      // console.log(newName.value);
      addPhoto(photo.files, selectedAlbum, desc.value, newName.value);
      photo.value = '';
      desc.value = '';
      newName.value = '';
    }}>
      <div className="form-group">
        <input id="photo" className="form-control" type="file" multiple name="photo" placeholder="Upload Photo" ref={node => {
          photo = node;
        }}/>
      </div>
      <div className="form-group">
        <input id="desc" className="form-control" type="text" name="desc" placeholder="Description" autoComplete="off" ref={node3 => {
          desc = node3;
        }}/>
      </div>

      <div className="form-group">
        <select id="name" className="form-control" name="name">
          <option value="">Select Album</option>
          {albums}
          <option value="__newalbum">Create New Album</option>
        </select>
      </div>

      <div className="form-group new-name-hidden">
        <input id="newName" className="form-control" type="text" name="newName" placeholder="New Album" autoComplete="off" ref={node4 => {
          newName = node4;
        }}/>
      </div>

      <input type="submit" className="btn btn-primary" value="Submit" />
    </form>
  );
};

export default PhotoForm;
