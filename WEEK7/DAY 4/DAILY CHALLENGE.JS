import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Requires this import
import { Carousel } from 'react-responsive-carousel';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Travel Destinations</h2>
      <Carousel 
        showArrows={true} 
        infiniteLoop={true} 
        autoPlay={true} 
        interval={3000}
        showThumbs={true} // Set to true to match your image requirement
      >
        <div>
          <img src="https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/jrfyzvgzvhs1iyi7v9bt.jpg" alt="Hong Kong" />
          <p className="legend">Hong Kong</p>
        </div>
        <div>
          <img src="https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/c1pyspwjssc9xyp7vczu.jpg" alt="Macao" />
          <p className="legend">Macao</p>
        </div>
        <div>
          <img src="https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/e8fnw35pbmvhi4uf70ba.webp" alt="Japan" />
          <p className="legend">Japan</p>
        </div>
        <div>
          <img src="https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/liw377az16sxmp9a6ylg.webp" alt="Las Vegas" />
          <p className="legend">Las Vegas</p>
        </div>
      </Carousel>
    </div>
  );
}

export default App;