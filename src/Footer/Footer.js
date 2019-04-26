import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class Footer extends Component {
  render() {
    return (
      <nav className="footer" id="footer">
        <ul id="navigation">
          <li><NavLink to="/">Etusivu</NavLink></li>
          <li><NavLink to="eula">Käyttöehdot</NavLink></li>
          <li><NavLink to="privacy">Tietosuojaseloste</NavLink></li>
          <li><NavLink to="instructions">Ohjeet</NavLink></li>
          <li><NavLink to="support">Tuki</NavLink></li>
        </ul>
      </nav>
    );
  }
}

export default Footer;