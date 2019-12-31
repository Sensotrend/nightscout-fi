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
              <h2 id="tietosuoja">Tietosuoja</h2>
              <small>Päivitetty 30.12.2019</small>
              <p>
                Tällä sivulla kerromme, miten ja miksi keräämme Sinua koskevia tietoja Nightscout
                Connect -palvelun käyttäjänä ja miten huolehdimme yksityisyydestäsi
              </p>

              <h2 id="mitatietojakeraamme">Mitä tietoja keräämme?</h2>
              <p>
                Keräämme Sinusta ainoastaan ne tiedot, jotka palvelun toteuttamisen kannalta ovat
                olennaisia. Terveystietojasi emme tallenna lainkaan, vaan ainoastaan välitämme ne
                Omakannan Omatietovarantoon, josta ne ovat saatavilla käyttöavainten (access token)
                avulla.
              </p>
              <p>
                Keräämme seuraavia tietoja:
                <ul>
                  <li>
                    Sähköpostiosoitteesi palvelun käyttöön liittyvistä poikkeustilanteista
                    (esimerkiksi palvelun virheellisen toiminnan aiheuttama vaaratilanne tai
                    tietovuoto) ilmoittamiseen.
                  </li>
                  <li>
                    Internet-palvelimen tekniset lokit palvelun toiminnan luotettavuuden
                    seuraamiseksi ja mahdollisten virhetilanteiden selvittämiseksi.
                  </li>
                  <li>
                    Käyttöavain (access token), joka luodaan Omatietovarannon liitosprosessissa ja
                    jonka avulla tietoa voidaan kirjoittaa Omatietovarantoon ja lukea sieltä.
                  </li>
                  <li>
                    Mahdollinen vikatilanneilmoituslupa, mikäli olet sen erikseen antanut, sekä
                    luvan myöntämisen ajankohta, palvelun vikatilanteista ilmoittamista varten.
                  </li>
                  <li>
                    Mahdollinen viestintälupa, mikäli olet sen erikseen antanut, sekä luvan
                    myöntämisen ajankohta, kyselyihin ja viestintään palvelun toiminnallisuuden,
                    asiakaspalvelun ja liiketoiminnan kehittämiseen sekä muihin vastaaviin
                    käyttötarkoituksiin.
                  </li>
                  <li>Mahdolliset muut itsesi erikseen antaman suostumuksesi perusteella kerättävät
                    tiedot.</li>
                </ul>
              </p>

              <h2 id="miksikeraammetietoja">Miksi keräämme tietoja?</h2>
              <p>
                Keräämme tietoa Sinulle arvokkaan palvelun toteuttamiseksi sekä kehittääksemme
                palveluitamme paremmin diabetikoiden, heidän läheistensä ja heitä hoitavien
                ammattilaisten tarpeita vastaaviksi.
              </p>

              <h2 id="mitenkeraammejakasittelemmetietoja">Miten keräämme ja käsittelemme tietoja?</h2>
              <p>
                Palvelun teknistä toteuttamista vaatiman automaattisen tiedonkeruun lisäksi keräämme
                henkilötioetoja ainoastaan silloin, kun palvelu kysyy Sinulta tietojasi. Otamme
                yksityisyytesi suojan vakavasti ja keräämme sekä käsittelemme tietojasi ainoastaan,
                kun palvelun toteuttaminen sitä vaatii.
              </p>
              <p>Tietojasi ei käytetä automatisoituun päätöksentekoon eikä profilointiin.</p>

              <h2 id="automaattinentietojenkeraaminen">Automaattinen tietojen kerääminen</h2>
              <p>
                Tiedot, joita keräämme automaattisesti:
      				  <ul>
                  <li>Internet-palvelimen tekniset lokit</li>
                  <li>Käyttöavaimet (access token)</li>
                </ul>
              </p>

              <h2 id="mitenvarmistammehenkilotiedontietosuojan">
                Miten varmistamme henkilötiedon tietosuojan?
              </h2>
              <p>
                Noudatamme EU:n yleiseen tietosuoja-asetuksen (GDPR) vaatimia asianmukaisia
                hallinnollisia ja tietoteknisiä toimia henkilötietojesi suojaamiseksi. Jokainen
                IT-järjestelmämme arvioidaan tietoturvan näkökulmasta ja tietoturvakäytäntöjämme
                kehitetään jatkuvasti.
              </p>

              <h2 id="oikeutesipalvelunkayttajana">Oikeutesi palvelun käyttäjänä</h2>
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

              <h2 id="yhteystiedot">Yhteystiedot</h2>
              <p>Sensotrend Oy, 2606155-7, Koulukatu 16 B 41, 33200 Tampere.</p>
              <p>
                Tietosuojavastaava Hannu Hyttinen, <a
                href="mailto:privacy@sensotrend.com">privacy@sensotrend.com</a>.
              </p>

              <h2 id="muutoksetjapaivitykset">Muutokset ja päivitykset</h2>
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
