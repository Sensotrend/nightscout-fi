import React, { Component } from 'react';

const apiURL = process.env.REACT_APP_API_URL;

class Settings extends Component {
  render() {
    const { config } = this.props;
    console.log('API URL', apiURL, process.env);
    return (
      <div id='settings'>
        <p>Voit liittää Nightscout-sovelluksia Omatietovaranto-tiliisi näillä asetuksilla:</p>
        <table>
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
        <p>Pidä salaisuudesta ja osoitteesta hyvää huolta, ettei kukaan ulkopuolinen pääse käsiksi
          tietoihisi.</p>
        <p>Palvelun REST rajapinta on applikaatioiden käytössä myös uloskirjautumisen jälkeen.</p>
        <p>Lue palvelun <a href="instructions">käyttöohjeista</a> lisätietoa yhteensopivista
          sovelluksista.</p>
        <a href="logout">
          <button className="button-secondary large pure-button">Kirjaudu ulos</button>
        </a>
      </div>
    );
  }
}

export default Settings;
