import React, { Component, Fragment } from 'react';
import Octicon, {CloudUpload} from '@githubprimer/octicons-react';

import { server } from '../Api/Api';
import ActionsMenu from '../Actions/ActionsMenu';
import Description from '../Instructions/Description';
import ParallaxComponent from '../Parallax/ParallaxComponent';

export const loginEnabled = (
  (document.location.hostname.indexOf('test') === 0) ||
  (document.location.hostname.indexOf('dev') === 0) ||
  (document.location.hostname.indexOf('localhost') === 0)
);

class Login extends Component {
  render() {
    return (
      <Fragment>
        <ParallaxComponent>
          <Description />
          <section id="ohjeet">
            <div className="container">
              <p>Lue lisää <a href="instructions">ohjeet-sivulta</a>.</p>
            </div>
          </section>
          <section id="prompt">
            <div className="container">
              <p>Aloita palvelun käyttö kirjautumalla Omatietovarantoon.</p>
            </div>
          </section>
        </ParallaxComponent>
        <div id="login">
          <ActionsMenu>
            {loginEnabled
              ? (
                <a href={`${server}/fiphr/launch/loginIn`} className="success">
                  <Octicon icon={CloudUpload} verticalAlign="middle" size="medium" />
                  <span>Kirjaudu</span>
                </a>
              )
              : (
                <p>Palvelu on vielä kehityksen alla, sisäänkirjautuminen on toistaiseksi kytketty pois päältä.</p>
              )
            }
          </ActionsMenu>
        </div>
      </Fragment>
    );
  }
}

export default Login;
