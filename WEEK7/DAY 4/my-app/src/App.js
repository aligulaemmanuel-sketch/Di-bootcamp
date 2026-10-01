import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './App.css';

function App() {
  const destinations = [
    {
      name: 'Hong Kong',
      image:
        'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/jrfyzvgzvhs1iylduuhj.jpg',
    },
    {
      name: 'Macao',
      image:
        'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/c1cklkyp6ms02tougufx.webp',
    },
    {
      name: 'Japan',
      image:
        'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/e8fnw35p6zgusq218foj.webp',
    },
    {
      name: 'Las Vegas',
      image:
        'https://res.klook.com/image/upload/fl_lossy.progressive,q_65/c_fill,w_480,h_384/cities/liw377az16sxmp9a6ylg.webp',
    },
  ];

  return (
    <main className="destination-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <header className="destination-heading">
              <p className="destination-eyebrow">A world of possibility</p>
              <h1>Where to next?</h1>
              <p className="destination-intro">
                Four places to start dreaming about your next getaway.
              </p>
            </header>

            <Carousel
              ariaLabel="Featured destinations"
              autoPlay
              infiniteLoop
              interval={5000}
              showStatus={false}
              showThumbs={false}
              stopOnHover
            >
              {destinations.map((destination) => (
                <div className="destination-slide" key={destination.name}>
                  <img src={destination.image} alt={destination.name} />
                  <p className="legend">{destination.name}</p>
                </div>
              ))}
            </Carousel>

            <p className="carousel-note">A little inspiration, one slide at a time.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
