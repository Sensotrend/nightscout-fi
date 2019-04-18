import React, { Component } from 'react';

import { server } from '../Api/Api';
import { fetchConfig } from '../Routes/Routes';

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: true,
    };
  }

  componentDidMount() {
    console.log('Logging out', server);
    fetch(`${server}/logout`, fetchConfig)
    .then(res => {
      const { status } = res;
      if (status !== 200) {
        const error = new Error(`Error logging out, status: ${status} ${res.statusText}`);
        error.response = res;
        throw error;
      }
      this.setState({
        processing: false,
        error: false,
      });
    })
    .catch(error => {
      console.error('Unable to log out!', error);
      this.setState({
        processing: false,
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
