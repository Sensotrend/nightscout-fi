import React, { Component, Fragment } from 'react';

import { server } from '../Api/Api';
import Description from '../Instructions/Description';

class Login extends Component {
  render() {
    return (
      <Fragment>
        <Description />
        <div id='login'>
          {process.env.REACT_APP_HIDE_LOGIN
          ? (
            <p>Palvelu on vielä kehityksen alla, sisäänkirjautuminen on toistaiseksi kytketty pois päältä.</p>
          )
          : (
            <a href={`${server}/fiphr/launch`}>
              <button className="button-success large pure-button">Kirjaudu</button>
            </a>
          )
          }
        </div>
      </Fragment>
    );
  }
}

export default Login;
