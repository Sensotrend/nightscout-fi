import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import './footer.scss';

class Footer extends Component {
  render() {
    return (
      <footer>
        <nav role="navigation">
          <div id="menuToggle">
            <div className="burgerMenu">
              <span className="burger"></span>
              <span className="burger"></span>
              <span className="burger"></span>
            </div>
            <input type="checkbox" />
            <ul id="navi">
              <li><NavLink to="/">Etusivu</NavLink></li>
              <li><NavLink to="eula">Käyttöehdot</NavLink></li>
              <li><NavLink to="privacy">Tietosuoja</NavLink></li>
              <li><NavLink to="instructions">Ohjeet</NavLink></li>
            </ul>
          </div>
        </nav>
      </footer>
    );
  }
}

export default Footer;