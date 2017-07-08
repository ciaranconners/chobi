import React from 'react';
import PhotoForm from './photoform.jsx';

/* ------------------------------
Render Navbar to top of page:
  -uses bootstrap navbar
  -calls on PhotoForm

_________________________________
PhotoForm receives:
  - addPhoto      as  addPhoto
  - currentUser   as  currentUser
  - selectAlbum   as  selectAlbum
  - getAlbum      as  getAlbum
_________________________________


-------------------------------*/

const Navbar = ({addPhoto, currentUser, selectAlbum, addFriend, friends, selectedAlbum, confirmFriend, denyFriend, showAlbums}) => {
  var username;

  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/"><img src="../images/Chobi.png" /></a>
        </div>

        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

          <ul className="nav navbar-nav navbar-right">


            <li><form onSubmit={(e) => {
              e.preventDefault();
              addFriend(username.value);
              username.value = '';
            }}>
            <input className="searchFriend" placeholder="Enter a friend's username" ref={node2 => {
              username = node2;
            }}></input><button type="submit" value="Submit">Submit</button></form></li>


            <li className="dropdown">
              <button className="dropdown-toggle" data-toggle="dropdown"><span className="glyphicon glyphicon-bell"></span></button>
              <div className="dropdown-menu">
                <p>Friend Requests</p>
                {friends.map((friend) => {
                  if (friend.status === 'pending') {
                    return (<div>{friend.username}<button onClick={() => {confirmFriend(friend.username)}}><span className="glyphicon glyphicon-ok"></span></button><button onClick={() => {denyFriend(friend.username)}}><span className="glyphicon glyphicon-remove"></span></button></div>);
                    }
                  }
                )}

                <p>Friends</p>
                {friends.map((friend) => {
                  if (friend.status === 'accepted') {
                    return (<div>{friend.username}<button onClick={() => {showAlbums(friend.username)}}>Show albums</button><button onClick={() => {denyFriend(friend.username)}}><span className="glyphicon glyphicon-remove"></span></button></div>);
                    }
                  }
                )}

              </div>
            </li>


            <li className="dropdown">
              <a className="dropdown-toggle" href="#" data-toggle="dropdown">Upload<span className="caret"></span></a>
              <div className="dropdown-menu">
                <PhotoForm
                  addPhoto={addPhoto}
                  currentUser={currentUser}
                  selectAlbum={selectAlbum}
                  selectedAlbum={selectedAlbum}
                />
              </div>
            </li>

            <li>
              <a href="/auth/logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
