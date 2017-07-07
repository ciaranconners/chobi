import React from 'react';

/* ------------------------------
Render a slideshow carousel to the page for a single album:
 -carousel shows single photo with controls for previous and next
 -carousel indicators renders thumbnails of the entire album of photos and can control the main carousel
 -triggers a lightbox on click of the photo in the main carousel
-------------------------------*/
class AlbumPhotoDisplay extends React.Component {
  constructor(props) {
    // props: photos, currentPhoto
    super(props);
  }

  render() {
    return (
      <div>
        <div id="myCarousel" className="carousel slide" data-ride="carousel">
          <div className="carousel-inner cont-slider">{
            this.props.photos.map((photo, i) => {
              if (i === this.props.currentPhoto) {
                return (
                  <div className="item active" data-slide-number={i}>
                    <a href={photo.url} data-toggle="lightbox">
                      <img src={photo.url} />
                    </a>
                    <div className="carousel-caption"><h3 >{photo.description}</h3></div>
                  </div>
                )
              }
              if (i !== this.props.currentPhoto) {
                return (
                  <div className="item" data-slide-number={i}>
                    <a href={photo.url} data-toggle="lightbox">
                      <img src={photo.url} />
                    </a>
                    <div className="carousel-caption"><h3 >{photo.description}</h3></div>
                  </div>
                )
              }
            })
          }</div>
          <a className="carousel-control left" href="#myCarousel" data-slide="prev">
              <span className="glyphicon glyphicon-chevron-left"></span>
          </a>
          <a className="carousel-control right" href="#myCarousel" data-slide="next">
              <span className="glyphicon glyphicon-chevron-right"></span>
          </a>
        </div>

        <button id="carouselBtn" onClick={startStopCarousel}>Start Slideshow</button>

        <ol className="carousel-indicators">{
          this.props.photos.map((photo, i) => {
            return (
              <li className="" data-slide-to={i} data-target="#myCarousel">
                <img src={photo.url}/>
              </li>
            )
          })
        }</ol>
      </div>
    )
  }
}

export default AlbumPhotoDisplay;
