import React, { Component } from 'react';

import { server } from '../Api/Api';

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: true,
    };
  }

  componentDidMount() {
    fetch(`${server}/logout`, {
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
    })
    .then(res => res.json())
    .then(json => {
      this.setState({
        initializing: false,
        error: false,
      });
    })
    .catch(error => {
      console.error('Unable to log out!', error);
      this.setState({
        initializing: false,
        error,
      });
    });
  }

  render() {
    const { error, processing } = this.state;
    let contents;
    
    if (error) {
      contents = <p className="error">Uloskirjautumisessa tapahtui virhe! Sulje selain varmuuden vuoksi.</p>;
    } else if (processing) {
      contents = <p>Kirjaudutaan ulos...</p>;
    } else {
      contents = <p>Olet kirjautunut ulos.</p>;
    }
    return (
      <div id="logout">
        { contents }
      </div>
    );
  }
}

export default Logout;
