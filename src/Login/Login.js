import React, { Component, Fragment } from 'react';

import { server } from '../Api/Api';
import ActionsMenu from '../Actions/ActionsMenu';
import Description from '../Instructions/Description';
import ParallaxComponent from '../Parallax/ParallaxComponent';

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
        </ParallaxComponent>
        <div id="login">
          <ActionsMenu>
            {((document.location.href.indexOf('test') < 0) && (document.location.href.indexOf('localhost') < 0))
              ? (
                <p>Palvelu on vielä kehityksen alla, sisäänkirjautuminen on toistaiseksi kytketty pois päältä.</p>
              )
              : (
                <a href={`${server}/fiphr/launch`}>
                  <button className="button-success large pure-button">Kirjaudu</button>
                </a>
              )
            }
          </ActionsMenu>
        </div>
      </Fragment>
    );
  }
}

export default Login;
