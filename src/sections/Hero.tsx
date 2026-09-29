import "./Hero.css";

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="hero-label">
          PHOTOGRAPHY • VIDEOGRAPHY • EDITING
        </p>

        <h1>
          SEE THE MOMENT.
          <br />
          <span>CREATE THE STORY.</span>
        </h1>

        <p className="hero-description">
          We capture meaningful moments through photography,
          videography, and visual storytelling.
        </p>

        <div className="hero-actions">
          <a href="#portfolio" className="hero-primary">
            Explore Portfolio
          </a>

          <a href="#booking" className="hero-secondary">
            Book a Session
          </a>
        </div>
      </div>
    </section>
  );
}