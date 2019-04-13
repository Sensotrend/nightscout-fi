import React, { Component } from 'react';

import Login from '../Login/Login';

class Index extends Component {
  render() {
    return (
      <div>
        <p>Nightscout Connect on Kanta-palveluihin kytketty palvelu,
          jonka avulla Nightscout-sovelluksia voi käyttää <a
          href="https://www.kanta.fi/web/guest/hyvinvointitiedot">Omatietovarannon</a> kanssa.
        </p>
        <p>Nightscout-sovellukset ovat avoimen lähdekoodin kehittäjäyhteisön luomia sovelluksia.
          Sovellusten tarkoitus on helpottaa elämää diabeteksen kanssa.
          Nämä sovellukset eivät tyypillisesti ole virallisia terveydenhuollon laitteita,
          vaan kansalaiset käyttävät näitä omalla vastuullaan. Lisätietoa Nightscout-sovelluksista
          löytyy sivustolta <a href="http://www.nightscout.info/">nightscout.info</a> sekä
          esimerkiksi suomenkielisestä <a href="https://www.facebook.com/groups/nightscoutsuomi/">
          Facebook-ryhmästä</a>.
        </p>
        <p>Nightscout Connect -palvelun avulla sovellusten käyttöönotto helpottuu, kun
          niiden vaatimaa palvelinta ei tarvitse pystyttää ja ylläpitää itse.
        </p>
        <p>Tulevaisuudessa palvelun avulla on myös mahdollista jakaa Nightscout-sovellusten
          keräämä tieto esimerkiksi lääkärin ja hoitajan kanssa.
        </p>
        <Login />
      </div>
    );
  }
}

export default Index;
