import React, { Component } from 'react';

import Description from './Description';
import Header from '../Header/Header';
import { server } from '../Api/Api';
import auth2Image from '../tunnistautuminen-2.png';
import consentImage from '../luvitus.png';
import emailRegImage from '../rekisteröityminen.png';
import credentialsImage from '../tunnukset.png';
import settingsImage from '../asetukset.png';
import preferencesImage from '../muokkaus.png';
import removeImage from '../lopetus.png';
import './instructions.scss';

class Instructions extends Component {
  render() {
    // const { config } = this.props;
    return (
      <main id='instructions'>
        <Header />
        <Description />
        <section id="future">
          <div className="container">
            <p>
              Tulevaisuudessa palvelun avulla on myös mahdollista jakaa Nightscout-sovellusten
              keräämä tieto esimerkiksi lääkärin ja hoitajan kanssa.
            </p>
          </div>
        </section>
        <section id="functionality">
          <div className="container">
            <h2>Palvelun toiminta</h2>
            <p>
              Nightscout.fi tarjoaa itse toteutettua Nightscout-palvelua vastaavan rajapinnan
              tiedon tallentantamista ja hakemista varten, mutta tallentaa tiedot
              Omatietovarantoon, jolloin käyttäjä voi ottaa palvelun käyttöönsä helposti. Palvelu
              ei tarjoa näkymää tietoon, vaan tarvitset tiedon tallentamiseen ja näyttämiseen
              Nightscout-yhteensopivan sovelluksen, kuten xDrip-mobiilisovelluksen tai esimerkiksi
              Android Wear Nightwatch sovelluksen älykelloon.
            </p>
          </div>
        </section>
        <section id="apps">
          <div className="container">
            <h2>Testatut sovellukset</h2>
            <p>
              <strong>
                Huomaathan, että palvelun yhteydessä käytettävät Nightscout-sovellukset eivät
                tyypillisesti ole virallisesti markkinoille tuotuja terveydenhuollon laitteita, vaan
                avoimen lähdekoodin kehittäjäyhteisön luomia sovelluksia, jotka kukin käyttäjä ottaa
                käyttöönsä itse ja joita eivät koske markkinoille tuotuja terveydenhuollon laitteita
                koskevat lait ja asetukset ja joiden käyttö on itse kunkin kansalaisen omalla
                vastuulla.
              </strong>              
            </p>
            <p>Ja varmuuden vuoksi vielä samma på svenska.</p>
            <p>
              <strong>
                Vänligen observera att Nightscout-applikationer som används i samband med den här
                tjänsten vanligtvis inte är officiellt marknadsförda vårdapparater, utan
                applikationer skapade av en open source -utvecklingssamhället, som varje användare
                implementerar för sig själv på egen risk och som inte omfattas av lagarna och
                reglerna för officiellt marknadsförda vårdapparater.             
              </strong>
            </p>
            <p>
              Palvelu on testattu toimivaksi seuraavilla sovelluksilla:
              <ul>
                <li>
                  <a href="https://jamorham.github.io/#xdrip-plus"
                  target="_new">xDrip</a>, versiot 2019.05.18 ja 2019.12.22: tiedon tallentaminen
                  ja näyttäminen Nightscout Follower -moodissa
                </li>
                <li>
                  <a href="http://stephenblackwasalreadytaken.github.io/NightWatch/"
                  target="_new">Nightwatch</a> v2.0.4_2: tiedon näyttäminen</li>
              </ul>
              Nightscout-sovellusten ekosysteemi on varsin kirjava ja palvelu saattaa toimia tai
              olla toimimatta lukuisten muidenkin sovellusten ja versioiden kanssa. Pyrimme
              ylläpitämään sovelluslistaa tällä sivulla. Jos olet itse todentanut jonkin
              sovelluksen version toimivuuden, olethan yhteydessä osoitteeseen <a
              href="mailto:info@sensotrend.com">info@sensotrend.com</a>, niin lisäämme tiedon
              tänne. Kiitokset jo etukäteen!
            </p>
          </div>
        </section>
        <section id="data">
          <div className="container">
            <h2>Palvelun tukemat tietomuodot</h2>
            <p>
              Nightscout.fi välittää tällä hetkellä verensokeritiedot, hiilihydraattiarviot ja
              insuliiniannokset eri Nightscout-sovellusten ja Omatietovarannon välillä. Palvelu
              tukee verensokeritietoa niin sensoreista kuin sormenpäämittauksistakin.
            </p>
          </div>
        </section>
        <section id="usage">
          <div className="container">
            <h2>Käyttöohjeet</h2>
            <p>
              Tietoa Nightscout sovelluksista löytyy osoitteesta <a
              href="http://www.nightscout.info/">nightscout.info</a> sekä esimerkiksi
              suomenkielisestä <a
              href="https://www.facebook.com/groups/nightscoutsuomi/">Facebook-ryhmästä</a>.
            </p>
            <p>
              Seuratessasi näitä ohjeita huomaathan, että Nightscout.fi-palvelua käyttäessäsi sinun
              ei tarvitse luoda itsellesi GitHub-tiliä eikä pystyttää Nightscout-palvelua Herokuun,
              vaan Nightscout.fi-palvelu hoitaa tämän osuuden kokonaisuudesta. Sen sijaan sinun
              täytyy edelleen asentaa kaikki älypuhelimiin ja älykelloihin tarvittavat sovellukset
              niiden ohjeiden mukaisesti. Näiden sovellusten tarvitsemat <code>REST API
              URL</code> ja <code>API_SECRET</code> -asetukset saat tästä Nightscout.fi-palvelusta.
            </p>

            <h3 id="onboarding">Palvelun käyttöönotto</h3>
            <p>
              Palvelun käyttöönottoon liittyy 5 vaihetta:
              <ol>
                <li id="signin">
                  <figure>
                    <figcaption>
                      Aloita < a href={`${server}/fiphr/launch`} target="_blank">kirjautumalla
                      Omatietovarantoon</a>.
                    </figcaption>
                    <img src={auth2Image} />
                  </figure>
                </li>
                <li>
                  <figure>
                    <figcaption>
                      Salli Nightscout.fi-sovelluksen lukea ja kirjoittaa tietoja puolestasi
                      Omatietovarantoon.
                    </figcaption>
                    <img src={consentImage} />
                  </figure>
                </li>
                <li>
                  <figure>
                    <figcaption>
                      Kerro sähköpostiosoitteesi, jotta voimme tarvittaessa olla yhteydessä sinuun,
                      esimerkiksi vakavan virhetilanteen tai tietovuodon yhteydessä. Halutessasi
                      voit saada sähköpostiosoitteeseesi myös tietoa palvelunn kehittymisestä.
                    </figcaption>
                    <img src={emailRegImage} />
                  </figure>
                </li>
                <li>
                  <figure>
                    <figcaption>
                      Saat palvelulta omat <code>REST API URL</code> ja <code>API_SECRET</code> -
                      asetuksesi, jotka voit antaa käyttämillesi Nightscout-sovelluksille.
                    </figcaption>
                    <img src={credentialsImage} />
                  </figure>
                </li>
              </ol>
            </p>
            <p>
              Syötettyäsi asetukset Nightscout-sovelluksille data alkaa virrata sovellusten ja
              Omatietovarannon välillä. Voit nyt kirjautua ulos palvelusta <strong>Poistu</strong>
              -valinnan avulla.
            </p>

            <h3 id="settings">Asetusten muokkaaminen</h3>
            <p>
              Voit koska tahansa muokata rekisteröimääsi sähköpostiosoitetta ja siihen liittyviä
              asetuksiasi.
              <ol>
                <li>Aloita kirjautumalla Omatietovarantoon kuten <a href="#signin">yllä</a>.</li>
                <li>
                  <figure>
                    <figcaption>
                      Päädyttyäsi takaisin Nightscout Connect -näkymään,
                      valitse <strong>Asetukset</strong>.
                    </figcaption>
                    <img src={settingsImage} />
                  </figure>
                </li>
                <li>
                  <figure>
                    <figcaption>
                      Asetukset-näkymässä pääset vaihtamaan rekisteröimääsi sähköpostiosoitetta ja
                      asetuksiasi postin käyttämiseksi.
                    </figcaption>
                    <img src={preferencesImage} />
                  </figure>
                </li>
              </ol>
            </p>
            <p>
              Valitse lopuksi näkymästä <strong>Tallenna</strong>.
            </p>
            <p>
              Jos muokkaat sähköpostiosoitettasi, sinulle lähetetään ilmoittamaasi uuteen
              osoitteeseen vahvistusviesti, jossa olevaa linkkiä klikkaamalla uusi osoite
              aktivoituu. Siihen asti edellinen vahvistettu osoite pysyy voimassa.
            </p>

            <h3 id="remove">Palvelun käytön lopettaminen</h3>
            <p>
              Voit koska tahansa lopettaa palvelun käytön ja poistaa kaikki tietosi palvelusta.
              <ol>
                <li>Aloita kirjautumalla Omatietovarantoon kuten <a href="#signin">yllä</a>.</li>
                <li>
                  <figure>
                    <figcaption>
                      Päädyttyäsi takaisin Nightscout Connect -näkymään,
                      valitse <strong>Asetukset</strong>.
                    </figcaption>
                    <img src={settingsImage} />
                  </figure>
                </li>
                <li>
                  <figure>
                    <figcaption>
                      Asetukset-näkymässä valitse <strong>Poista tili</strong> ja vahvista
                      valintasi.
                    </figcaption>
                    <img src={removeImage} />
                  </figure>
                </li>
              </ol>
            </p>
            <p>
              Käyttäjätilisi ja kaikki tietosi on nyt poistettu palvelusta. Huomaathan, että
              palvelun kautta Omatietovarantoon tallennetut tiedot pysyvät edelleen
              Omatietovarannossa. Mikäli tahdot poistaa nekin, seuraa Omatietovarannon ohjeita
              tietojen poistamiseksi.
            </p>
          </div>
        </section>
        <section id="participate">
          <div className="container">
            <h2>Osallistu palvelun kehitykseen</h2>
            <p>Tätä palvelua kehitetään avoimena lähdekoodina ja olet erittäin tervetullut
              osallistumaan kehitykseen GitHubissa. Ks. <a
              href="https://github.com/Sensotrend/nightscout-fi">nightscout-fi</a>.
            </p>
          </div>
        </section>
        <section id="questions">
          <div className="container">
            <h2>Lisäkysymykset</h2>
            <p>Jäikö jokin asia vielä askarruttamaan? Ole rohkeasti yhteydessä osoitteeseen <a
              href="mailto:info@sensotrend.com">info@sensotrend.com</a>, niin selvitetään asia!
            </p>
          </div>
        </section>
      </main>
    );
  }
}

export default Instructions;
