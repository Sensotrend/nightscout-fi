import React, { Component } from 'react';

import { server } from '../Api/Api';

class EmailRequest extends Component {
  render() {
    return (
      <div id="registration">
        <h2>Rekisteröityminen</h2>
        <p>Tarvitsemme sähköpostiosoitteesi voidaksemme tiedottaa kriittisistä vikatilanteista palvelussa.</p>
        <p>Voit halutessasi saada sähköpostiosoitteeseesi myös tietoja palvelun vähemmän kriittisistä virhetilanteista.</p>
        <p>Voit myös ilmaista halusi osallistua palvelun jatkokehitykseen.</p>
        <p><a href="privacy">Tietosuojaseloste</a> kertoo tarkemmin tietojesi käytöstä.</p>
        <form action={`${server}/sendverificationrequest`}>
          <div>
            <input type="email" id="email" placeholder="sahkopostiosoite@palvelin.com"></input>
          </div>
          <div className="checkbox">
            <input type="checkbox" id="notifications"></input>
            <label for="notifications">Tahdon saada sähköpostiini tietoja palvelun vikatilanteista (esimerkiksi verkkoyhteyden tilapäinen katkeaminen).</label>
          </div>
          <div className="checkbox">
            <input type="checkbox" id="development"></input>
            <label for="development">Minulle saa lähettää viestejä ja kysymyksiä liittyen palvelun jatkokehitykseen</label>
          </div>
          <div>
            <button className="large primary button-success" type="submit">Lähetä!</button>
          </div>
        </form>
      </div>
    );
  }
}

export default EmailRequest;
