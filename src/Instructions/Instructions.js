import React, { Component } from 'react';

import Description from './Description';
import './instructions.scss';
import Header from '../Header/Header';

class Instructions extends Component {
  render() {
    // const { config } = this.props;
    return (
      <main id='instructions'>
        <Header />
        <Description />
        <div className="container">
        <p>Tulevaisuudessa palvelun avulla on myös mahdollista jakaa Nightscout-sovellusten
          keräämä tieto esimerkiksi lääkärin ja hoitajan kanssa.
        </p>
        </div>
        <section>
          <div className="container">
            <h2>Palvelun toiminta</h2>
            <p>Nightscout.fi tarjoaa käyttäjilleen Nightscoutia vastaavan rajapinnan tiedon tallentantamista ja hakemista varten,
              mutta tallentaa tiedot Omatietovarantoon, jolloin käyttäjä voi ottaa palvelun käyttöönsä helposti. Palvelu ei tarjoa
              näkymään tietoon, vaan tarvitset tiedon tallentamiseen ja näyttämiseen Nightscout-yhteensopivan sovelluksen, kuten
              xDrip tai Spike mobiilisovellukset tai esimerkiksi Android Wear Nightwatch sovelluksen älykelloon.
        </p>
          </div>
        </section>
        <section>
          <div className="container">
            <h2>Käyttöohjeet</h2>
            <p>Tietoa Nightscout sovelluksista löytyy osoitteesta <a href="http://www.nightscout.info/">nightscout.info</a> sekä
            esimerkiksi suomenkielisestä <a href="https://www.facebook.com/groups/nightscoutsuomi/">
                Facebook-ryhmästä</a>.
        </p>
            <h2>Testatut sovellukset</h2>
            <p>
              Palvelu on testattu toimivaksi seuraavilla sovelluksilla.
        </p>
            <ul>
              <li><b><a href="https://jamorham.github.io/#xdrip-plus" target="_new">xDrip</a></b>: tiedon tallentaminen ja näyttäminen Nightscout Follower -moodissa</li>
              <li><b><a href="http://stephenblackwasalreadytaken.github.io/NightWatch/" target="_new">Nightwatch</a></b>: tiedon näyttäminen</li>
            </ul>
            <h2>Palvelun tukemat tietomuodot</h2>
            <p>Nightscout.fi välittää tällä hetkellä vain verensokeritiedot eri Nightscout-sovelluksien välillä.
              Palvelu tukee verensokeritietoa niin sensoreista kuin sormenpäämittauksistakin.
        </p>
          </div>
        </section>
      </main>
    );
  }
}

export default Instructions;
