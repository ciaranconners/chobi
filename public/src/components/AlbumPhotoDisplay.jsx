import React from 'react';

/* ------------------------------
Render a slideshow carousel to the page for a single album:
 -carousel shows single photo with controls for previous and next
 -carousel indicators renders thumbnails of the entire album of photos and can control the main carousel
 -triggers a lightbox on click of the photo in the main carousel
-------------------------------*/

const AlbumPhotoDisplay = ({photos, albums, selectAlbum, currentPhoto}) => {
  const slides = photos.map((photo, i) => {
    if (i === currentPhoto) {
      return (
        <div className="item active" data-slide-number={i}>
          <a href={photo.url} data-toggle="lightbox">
            <img src={photo.url} alt="" />
          </a>
          <div className="carousel-caption"><h3 >{photo.description}</h3></div>
        </div>
      )
    }
    if (i !== currentPhoto) {
      return (
        <div className="item" data-slide-number={i}>
          <a href={photo.url} data-toggle="lightbox">
            <img src={photo.url} alt="" />
          </a>
          <div className="carousel-caption"><h3 >{photo.description}</h3></div>
        </div>
      )
    }
  })
  const indicators = photos.map((photo, i) => {
    return (<li className="" data-slide-to={i} data-target="#myCarousel"><img alt="" src={photo.url}/></li>)
    })
  return (
    <div>
      <div id="myCarousel" className="carousel slide" data-ride="carousel">
        {/*Wrapper for carousel items*/}
        <div className="carousel-inner cont-slider">
          {slides}
        </div>
        {/*Carousel controls*/}
        <a className="carousel-control left" href="#myCarousel" data-slide="prev">
            <span className="glyphicon glyphicon-chevron-left"></span>
        </a>
        <a className="carousel-control right" href="#myCarousel" data-slide="next">
            <span className="glyphicon glyphicon-chevron-right"></span>
        </a>
      </div>
      <button id="carouselBtn" onClick={startStopCarousel}>Start Slideshow</button>
      {/*Carousel indicators*/}
      <ol className="carousel-indicators">
        {indicators}
      </ol>
    </div>
  )
}

export default AlbumPhotoDisplay;


/// PLAN OF ACTION

  // add a button to the carousel wrapper
  // this button triggers a function call which sets an interval