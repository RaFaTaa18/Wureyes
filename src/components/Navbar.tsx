import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <a href="#" className="navbar-logo">
        WUREYES<span>_</span>
      </a>

      <nav className="navbar-menu">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#portfolio">Portfolio</a>
        <a href="#contact">Contact</a>
      </nav>

      <a href="#booking" className="navbar-button">
        Book a Session
      </a>
    </header>
  );
}