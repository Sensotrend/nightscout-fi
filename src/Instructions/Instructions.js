import React, { Component } from 'react';

import Description from './Description';

class Instructions extends Component {
  render() {
    const { config } = this.props;
    return (
      <div id='instructions'>
        <Description />
        <p>Tulevaisuudessa palvelun avulla on myös mahdollista jakaa Nightscout-sovellusten
          keräämä tieto esimerkiksi lääkärin ja hoitajan kanssa.
        </p>
        <h2>Käyttöohjeet</h2>
      </div>
    );
  }
}

export default Instructions;
