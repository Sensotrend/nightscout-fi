import React, { Component, Fragment } from 'react';

class Description extends Component {
  render() {
    return (
      <Fragment>
        <section id="nightscout">
          <div className="container">
            <h2>Helpompi tapa Nightscout-sovellusten käyttöönottoon</h2>
            <p>Nightscout-sovellukset ovat avoimen lähdekoodin kehittäjäyhteisön luomia
              sovelluksia. Sovellusten tarkoitus on helpottaa elämää diabeteksen kanssa. Nämä
              sovellukset eivät tyypillisesti ole virallisia terveydenhuollon laitteita, vaan
              kansalaiset käyttävät näitä omalla vastuullaan. Lisätietoa Nightscout-sovelluksista
              löytyy sivustolta <a href="http://www.nightscout.info/">nightscout.info</a> sekä
              esimerkiksi suomenkielisestä <a
              href="https://www.facebook.com/groups/nightscoutsuomi/">Facebook-ryhmästä</a>.
          </p>
            <p>Nightscout Connect -palvelun avulla sovellusten käyttöönotto helpottuu, kun
              niiden vaatimaa palvelinta ei tarvitse pystyttää ja ylläpitää itse.
          </p>
          </div>
        </section>
        <section id="kanta">
          <div className="container">
            <h2>Yhteys Kanta-palveluihin</h2>
            <p>Nightscout Connect -palvelun avulla Nightscout-sovellukset kytkeytyvät suoraan
              Kanta-palveluihin kuuluvaan <a
              href="https://www.kanta.fi/web/guest/hyvinvointitiedot">Omatietovarantoon</a>.
            </p>
            <p>Omatietovarantoon tallennettu tieto on aina täysin kansalaisen itsensä
              hallinnoitavissa. Sinä itse päätät, mitkä tahot ja sovellukset pääsevät käsiksi
              tietoihisi.
            </p>
            <p>Lähitulevaisuudessa pääset tutkimaan Omatietovarantoon tallennettuja tietoja eri
              sovellusten tuottamien analyysien avulla. Tietojen tallentaminen kannattaa aloittaa
              jo nyt!
            </p>
            <p>Lue lisää <a href="instructions">ohjeet-sivulta</a>.</p>
          </div>
        </section>
      </Fragment>
    );
  }
}

export default Description;
