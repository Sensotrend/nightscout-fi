import React, { Component, Fragment } from 'react';

class Description extends Component {
  render() {
    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

export default Description;
