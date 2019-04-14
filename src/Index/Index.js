import React, { Component } from 'react';

import Login from '../Login/Login';
import Settings from '../Settings/Settings';

class Index extends Component {
  render() {
    const { config } = this.props;
    return (
      <div>
        <p>Nightscout Connect on Kanta-palveluihin kytketty palvelu,
          jonka avulla Nightscout-sovelluksia voi käyttää <a
          href="https://www.kanta.fi/web/guest/hyvinvointitiedot">Omatietovarannon
          </a> kanssa. Lue lisää <a href="instructions">ohjeet-sivulta</a>.
        </p>
        { config
        ? <Settings config={config} />
        : <Login/>
        }
      </div>
    );
  }
}

export default Index;
