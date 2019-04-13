import React, { Component } from 'react';

import { server } from '../Api/Api';

class Login extends Component {
  render() {
    console.log('Server', server, process.env);
    return (
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
    );
  }
}

export default Login;
