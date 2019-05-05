import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';

class Settings extends Component {
  render() {
    const { config } = this.props;
    return (
      <main id="settings">
        <ParallaxComponent>
          <section id="nightscout">
            <div className="container">
              <table>
                <caption>
                  Voit liittää Nightscout-sovelluksia Omatietovaranto-tiliisi näillä asetuksilla:
                </caption>
                <tbody>
                  <tr>
                    <th>API SECRET</th>
                    <td>{config.secret}</td>
                  </tr>
                  <tr>
                    <th>REST API osoite</th>
                    <td>{`https://${config.secret}@${config.api}`}</td>
                  </tr>
                </tbody>
              </table>
              <p>Käsittele osoitetta huolellisesti, ettei kukaan ulkopuolinen pääse käsiksi
              tietoihisi.</p>
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
            <Link to="account">
              <button className="button-secondary large pure-button">Muokkaa asetuksia</button>
            </Link>
            <Link to="logout">
              <button className="button-warning large pure-button">Kirjaudu ulos</button>
            </Link>
          </ActionsMenu>;
        </div>
      </main>
    );
  }
}

export default Settings;
