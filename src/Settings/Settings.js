import React from 'react';
import { Link } from 'react-router-dom';
import Octicon, { CloudDownload, Gear } from '@githubprimer/octicons-react';

import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';

const Settings = () => {
  return (
    <main id="settings">
      <ParallaxComponent>
        <section id="nightscout">
          <div className="container">
            <p>Sensotrend-tilisi on luotu ja sähökpostiosoitteesi on vahvistettu!</p>
            <h4>Lataa Sensotrend Uploader -sovellus</h4>
            (Windows Marketplace -linkki)
            <br />
            (App Store -linkki)
            <ul>
              <li>Lataa asennusohjelma Windows -käyttöjärjestelmälle</li>
              <li>Lataa asennusohjelma Mac OSX -käyttöjärjestelmälle</li>
              <li>Lataa asennusohjelma Linux -käyttöjärjestelmälle</li>
            </ul>
            <h4>Lataa Sensotrend Mobile Medtronic Uploader -sovellus</h4>
            (Google Play -linkki)
          </div>
        </section>
        <section id='info'>
          <div className="container">
            <p>Nightscout-sovellukset voivat lukea ja kirjoittaa Omatietovaranto-tilisi
                tietoja, myös uloskirjautumisesi jälkeen.</p>
            <p>Lue palvelun <a href="instructions">käyttöohjeista</a> lisätietoa yhteensopivista
              sovelluksista.</p>
          </div>
        </section>
      </ParallaxComponent>
      <div id="account">
        <ActionsMenu>
          <Link to="/account">
            <button>
              <Octicon icon={Gear} verticalAlign="middle" size="medium" />
              <span>Asetukset</span>
            </button>
          </Link>
          <Link to="logout">
            <button>
              <Octicon icon={CloudDownload} verticalAlign="middle" size="medium" />
              <span>Poistu</span>
            </button>
          </Link>
        </ActionsMenu>;
        </div>
    </main>
  );
}

export default Settings;
