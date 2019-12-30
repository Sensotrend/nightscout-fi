import React, { Component, Fragment } from 'react';

import Header from '../Header/Header';

class Privacy extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <main id='privacy'>
          <section>
            <div className="container">
              <h2>Tietosuoja</h2>
              <p>
                Tällä sivulla kerromme, miten ja miksi keräämme Sinua koskevia tietoja Nightscout
                Connect -palvelun käyttäjänä ja miten huolehdimme yksityisyydestäsi
              </p>

              <h2>Mitä tietoja keräämme?</h2>
              <p>
                Keräämme Sinusta ainoastaan ne tiedot, jotka palvelun toteuttamisen kannalta ovat
                olennaisia. Terveystietojasi emme tallenna lainkaan, vaan ainoastaan välitämme ne
                Omakannan Omatietovarantoon, josta ne ovat saatavilla käyttöavainten (access token)
                avulla.
              </p>
              <p>
                Keräämme Sinusta seuraavia tietoja:
                <ul>
                  <li>Nimi ja sähköpostiosoite.</li>
                  <li>Internet-palvelimen tekniset lokit ja tiedot palvelun käytöstä.</li>
                  <li>Käyttöavaimet (access token), jotka luodaan palveluiden liitosprosessissa ja
                    joiden avulla tietoa voidaan kirjoittaa ulkoisten palveluntarjoajien
                  rekistereihin ja lukea niistä.</li>
                  <li>Mahdollinen viestintälupa sen erikseen antaneilta asiakkailta palvelun
                  kehitykseen liittyvää viestintää varten sekä luvan myöntämisen ajankohta.</li>
                  <li>Mahdollinen tietojen käyttölupa palvelun käytön, asiakaspalvelun ja
                    liiketoiminnan kehittämiseen, markkinointiin ja analysointiin sekä muihin
                  vastaaviin käyttötarkoituksiin sekä luvan myöntämisen ajankohta.</li>
                  <li>Mahdolliset muut asiakkaan suostumuksella kerättävät tiedot.</li>
                </ul>
              </p>

              <h2>Miksi keräämme tietoja?</h2>
              <p>
                Keräämme tietoa Sinulle arvokkaan palvelun toteuttamiseksi sekä kehittääksemme
                palveluitamme paremmin diabetikoiden, heidän läheistensä ja heitä hoitavien
                ammattilaisten tarpeita vastaaviksi.
              </p>

              <h2>Miten keräämme ja käsittelemme tietoja?</h2>
              <p>
                Palvelun teknistä toteuttamista vaatiman automaattisen tiedonkeruun lisäksi keräämme
                henkilötioetoja ainoastaan silloin, kun palvelu kysyy Sinulta tietojasi. Otamme
                yksityisyytesi suojan vakavasti ja keräämme sekä käsittelemme tietojasi ainoastaan,
                kun palvelun toteuttaminen sitä vaatii.
              </p>
              <p>Tietojasi ei käytetä automatisoituun päätöksentekoon tai profilointiin.</p>

              <h2>Automaattinen tietojen kerääminen</h2>
              <p>
                Tiedot, joita kerätään automaattisesti:
      				  <ul>
                  <li>Internet-palvelimen tekniset lokit ja tiedot palvelun käytöstä</li>
                  <li>Käyttöavaimet (access token)</li>
                </ul>
              </p>

              <h2>Miten varmistamme henkilötiedon tietosuojan?</h2>
              <p>
                Noudatamme EU:n yleiseen tietosuoja-asetuksen (GDPR) vaatimia asianmukaisia
                organisatorisia ja tietoteknisiä toimia henkilötietojesi suojaamiseksi. Jokainen
                IT-järjestelmämme arvioidaan tietoturvan näkökulmasta ja tietoturvakäytäntöjämme
                kehitetään jatkuvasti.
              </p>

              <h2>Oikeutesi palvelun käyttäjänä</h2>
              <p>
                Sinulla on kaikki EU:n yleisen tietosuoja-asetuksen mukaiset oikeudet, kuten oikeus
                tietojesi tarkastamiseen ja mahdollisten virheiden oikaisuus. Palvelun luonteen
                vuoksi tietojen poistaminen tapahtuu lopettamalla palvelun käyttö palvelun
                käyttöliittymän kautta. Tässä tilanteessa Sinusta tallennetut tiedot poistetaan
                teknisiä lokeja lukuun ottamatta automaattisesti.
              </p>
              <p>
                Oikeuksiasi koskevat pyynnöt pyydämme lähettämään tietosuojavastaavallemme, jonka
                yhteystiedot löydät alta.
              </p>

              <h2>Yhteystiedot</h2>
              <p>Sensotrend Oy, 2606155-7, Koulukatu 16 B 41, 33200 Tampere.</p>
              <p>
                Tietosuojavastaava Hannu Hyttinen, <a
                href="mailto:privacy@sensotrend.com">privacy@sensotrend.com</a>.
              </p>

              <h2>Muutokset ja päivitykset</h2>
              <p>
                Sensotrend Oy pidättää itsellään oikeuden tehdä muutoksia tähän
                tietosuojalausekkeeseen tarvittaessa.
              </p>
            </div>
          </section>
        </main>
      </Fragment>
    );
  }
}

export default Privacy;
