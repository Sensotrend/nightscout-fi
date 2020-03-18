import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import qrcode from 'qrcode';
import Octicon, { CloudDownload, Gear } from '@githubprimer/octicons-react';

import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';

const Settings = ({ config }) => {
  const apiUrl = `https://${config.secret}@${config.api}`;
  const data = { rest: { endpoint: [apiUrl] } };
  const dataString = JSON.stringify(data);
  const [qrImage, setQrImage] = useState(undefined);

  useEffect(() => {
    qrcode.toDataURL(dataString, {}, (err, url) => {
      console.log('QR code creation', { err, url });
      setQrImage(url);
    });
  }, [dataString]);

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
                  <td>{apiUrl}</td>
                </tr>
                {qrImage && (
                  <tr>
                    <th>QR-koodi</th>
                    <td><img src={qrImage} alt={dataString} /></td>
                  </tr>
                )}
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
