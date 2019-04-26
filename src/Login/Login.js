import React, { Component, Fragment } from 'react';

import { server } from '../Api/Api';
import ActionsMenu from '../Actions/ActionsMenu';
import Description from '../Instructions/Description';
import Header from '../Header/Header';
import ParallaxComponent from '../Parallax/ParallaxComponent';

class Login extends Component {
  render() {
    return (
      <Fragment>
        <ParallaxComponent>
          <Description />
        </ParallaxComponent>
        <div id="login">
          {((document.location.href.indexOf('test') < 0) && (document.location.href.indexOf('localhost') < 0))
            ? (
              <p>Palvelu on vielä kehityksen alla, sisäänkirjautuminen on toistaiseksi kytketty pois päältä.</p>
            )
            : (
              <ActionsMenu>
                <a href={`${server}/fiphr/launch`}>
                  <button className="button-success large pure-button">Kirjaudu</button>
                </a>
              </ActionsMenu>
            )
          }
        </div>
      </Fragment>
    );
  }
}

export default Login;
