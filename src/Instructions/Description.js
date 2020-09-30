import React, { Component, Fragment } from 'react';
import SizeBar from '../SideBar/SideBar';


export const DescriptionText = () => (
  <Fragment>
    <p>
      Sensotrend Connect -palvelun avulla siirrät tiedot verensokerimittareista, jatkuvatoimisista
      glukoosisensoreista ja insuliinipumpuista sekä muistitoiminnolla varustetuista älykkäistä
      insuliinikynistä <a
        href="https://www.kanta.fi/web/guest/hyvinvointitiedot">Omatietovarantoon</a>.
    </p>
    <p>
      Omatietovarantoon tallennettu tieto on aina täysin kansalaisen itsensä hallinnoitavissa. Sinä
      itse päätät, mitkä tahot ja sovellukset pääsevät käsiksi tietoihisi.
    </p>
    <p>
      Lähitulevaisuudessa pääset tutkimaan Omatietovarantoon tallennettuja tietoja eri sovellusten
      tuottamien analyysien avulla. Tietojen tallentaminen kannattaa aloittaa jo nyt!
    </p>
  </Fragment>
);

class Description extends Component {
  render() {
    return (
      <Fragment>
        <section id="nightscout">
       
          <div className="container">
           
            <SizeBar />
            
           
            <h2>Diabetesdata Omatietovarantoon</h2>
            <DescriptionText />
          </div>
        </section>
      </Fragment>
    );
  }
}

export default Description;
