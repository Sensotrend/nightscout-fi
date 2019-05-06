import React, { Component, Fragment } from 'react';

import Header from '../Header/Header';

class Privacy extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <main id='privacy'>
          <div className="container">
            <h2>Tietosuoja</h2>
          </div>
        </main>
      </Fragment>
    );
  }
}

export default Privacy;
