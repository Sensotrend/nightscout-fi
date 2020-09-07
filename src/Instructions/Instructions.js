import React, { Component, Fragment } from 'react';

import Description from './Description';
import Header from '../Header/Header';
import { server } from '../Api/Api';
import { loginEnabled } from '../Login/Login';
import auth2Image from '../tunnistautuminen-2.png';
import consentImage from '../luvitus.png';
import emailRegImage from '../rekisteröityminen.png';
import settingsImage from '../asetukset.png';
import preferencesImage from '../muokkaus.png';
import removeImage from '../lopetus.png';
import ceImage from '../ce.svg';
import manufacturerImage from '../manufacturer.svg';
import './instructions.scss';

class Instructions extends Component {
  render() {
    // const { config } = this.props;
    return (
      <main id='instructions'>
        <Header />
        <section id="version">
          <div className="container">
            <p><small>Versio {process.env.REACT_APP_VERSION}, päivitetty 8.6.2020</small></p>
          </div>
        </section>
        <Description />
        <section id="functionality">
          <div className="container">
            <h2>Palvelun toiminta</h2>
            <p>
              Palvelua käyttääksesi sinulla tulee olla käytössäsi tili Kanta-palveluihin kuuluvassa
              Omatietovarannossa.
            </p>
            <p>
              Voit liittää Sensotrend Connect -palvelun Omatietovarantoon. Tämän jälkeen voit
              siirtää tietoja Omatietovarantoon <a
                href="#SensotrendUploader">Sensotrend Uploader -sovelluksella</a>.
            </p>
            <p>
              Jos käytössäsi on Medtronicin 640G tai 670G -insuliinipumppujärjestelmä,
              voit halutessasi lisäksi käyttää <a
                href="#SensotrendMobileMedtronicUploader">Sensotrend Mobile Medtronic Uploader
              -sovellusta</a>.
            </p>
          </div>
        </section>
        <section id="safety">
          <div className="container">
            <h2>Tuoteturvallisuus</h2>
            <p>
              Teemme kaikkemme, jotta tiedot siirtyisivät laitteista Omatietovarantoon oikeassa
              muodossa ja testaamme palvelun toiminnan huolellisesti kaikilla niillä laitteilla,
              joita meillä on käytettävissämme palvelun kehityksessä.
            </p>
            <p>
              Ennen palvelun julkistusta sitä ovat testanneet myös useat vapaaehtoiset alpha- ja
              beta-testiryhmiemme jäsenet.
            </p>
            <p>
              <strong>
                Muistathan joka tapauksessa aina myös oman vastuusi insuliinin annostelussa.
                Esimerkiksi glukoosisensorin toiminta saattaa häiriintyä eri syistä ja
                tiedonsiirrossa saattaa esiintyä ongelmia. Älä koskaan tee annostelupäätöstä
                ainoastaan kudosglukoosisensorin lukeman perusteella. Mikäli sensorin antama lukema
                poikkeaa odotettavissa olevasta arvosta tai mikäli se ei vastaa tuntemuksiasi,
                varmistathan aina verensokerin tason verensokerimittarilla.
              </strong>
            </p>
            <p>Ja varmuuden vuoksi vielä samma på svenska.</p>
            <p>
              <strong>
                Du måste alltid tänka på ditt eget ansvar för insulinleverans. Glukosesensorn kan
                fungera felaktigt av olika skäl och kommunikationsproblem kan uppstå. Ta aldrig ett
                doseringsbeslut enbart på grundval av en vävnadsglukossensoravläsning. Om
                sensoravläsningen skiljer sig från det förväntade värdet eller om det inte stämmer
                med dina sinnen, kontrollera din blodsockernivån med en blodsockermätare.
              </strong>
            </p>
          </div>
        </section>
        <section id="apps">
          <div className="container">
            <h2>Yhteensopivat sovellukset ja laitteet</h2>
            <p></p>
            <article id="SensotrendUploader">
              <h3>Sensotrend Uploader</h3>
              <p>
                Sensotrend Uploader on tietokoneelle asennettava sovellus, joka purkaa tiedot
                laitteista USB-kaapelin välityksellä.
              </p>
              <h4>Sensotrend Uploaderin tukemat laitteet</h4>
              <h5>Verensokerimittarit</h5>
              <ul>
                <li>Abbott Freestyle Freedom Lite</li>
                <li>Abbott Freestyle Lite</li>
                <li>Abbott Precision Xtra</li>
                <li>Accu-Chek Aviva Connect</li>
                <li>Accu-Chek Guide</li>
                <li>Accu-Chek Guide Me</li>
                <li>Ascensia (Bayer) Contour Next</li>
                <li>Ascensia (Bayer) Contour Next Link</li>
                <li>Ascensia (Bayer) Contour Next Link 2.4</li>
                <li>Ascensia (Bayer) Contour Next One</li>
                <li>Ascensia (Bayer) Contour Next USB</li>
                <li>Ascensia (Bayer) Contour USB</li>
                <li>CareSens Dual BLE *</li>
                <li>CareSens N Premier BLE *</li>
                <li>OneTouch Ultra 2</li>
                <li>OneTouch UltraMini</li>
                <li>OneTouch Verio</li>
                <li>OneTouch Verio Flex</li>
                <li>OneTouch Verio IQ</li>
              </ul>
              <h5>Jatkuvatoimiset glukoosisensorit</h5>
              <ul>
                <li>Abbott Freestyle Libre</li>
                <li>Abbott Freestyle Libre Pro</li>
                <li>Dexcom G4</li>
                <li>Dexcom G5</li>
                <li>Dexcom G6</li>
                <li>Medtronic Guardian</li>
                <li>Medtronic Enlite</li>
              </ul>
              <h5>Insuliinipumput</h5>
              <ul>
                <li>Animas Ping</li>
                <li>Animas Vibe</li>
                <li>Insulet Omnipod</li>
                <li>Insulet Omnipod DASH</li>
                <li>Medtronic Minimed 523</li>
                <li>Medtronic Minimed 530Gs</li>
                <li>Medtronic Minimed 554</li>
                <li>Medtronic Minimed 640G</li>
                <li>Medtronic Minimed 670G</li>
                <li>Medtronic Minimed 723</li>
                <li>Medtronic Minimed 754</li>
                <li>Tandem t:flex</li>
                <li>Tandem t:slim</li>
                <li>Tandem t:slim G4</li>
                <li>Tandem t:slim X2</li>
              </ul>
            </article>
            <article id="SensotrendMobileMedtronicUploader">
              <h3>Sensotrend Mobile Medtronic Uploader</h3>
              <p>
                Sensotrend Mobile Medtronic Uploader on Android-puhelimiin asennettava
                mobiilisovellus, joka siirtää tiedot Medtronicin Minimed 640G - ja 670G
                -insuliinipumppujärjestelmistä USB-OTG-tiedonsiirtokaapelin avulla.
              </p>
              <p>
                Sovellus julkaistaan piakkoin Google Play Storessa. Lisäämme linkin tänne heti kun sovellus on julkaistu.
              </p>
            </article>
          </div>
        </section>
        <section id="data">
          <div className="container">
            <h2>Palvelun välittämät tiedot</h2>
            <p>
              Sensotrend Connect kirjoittaa tällä hetkellä Omatietovarantoon verensokeritiedot,
              hiilihydraattiarviot ja insuliiniannokset.
            </p>
            <p>
              Osallistumme aktiivisesti Omatietovarannon tukiprojektiin, jossa tietosisältöä
              kehitetään. Pyrimme jatkossa esimerkiksi tallentamaan lisää tietoa myös laitteista
              ja niiden asetuksista.
            </p>
          </div>
        </section>
        <section id="usage">
          <div className="container">
            <h2>Käyttöohjeet</h2>
            <h3 id="onboarding">Palvelun käyttöönotto</h3>
            <p>
              Palvelun käyttöönottoon liittyy 3 vaihetta:
            </p>
            <ol>
              <li id="signin">
                <figure>
                  <figcaption>
                    {loginEnabled
                      ? (
                        <Fragment>
                          Aloita <a href={`${server}/fiphr/launch`} target="_blank"
                            rel="noopener noreferrer">kirjautumalla Omatietovarantoon</a>.

                        </Fragment>
                      )
                      : (
                        <Fragment>
                          <s>Aloita kirjautumalla Omatietovarantoon.</s>
                          <p>
                            <em>
                              HUOM! Palvelu on vielä kehityskäytössä ja julkinen sisäänkirjautuminen on
                              poistettu käytöstä. Voit kuitenkin tutustua käyttöönoton vaiheisin
                              alla.
                            </em>
                          </p>
                        </Fragment>
                      )}
                  </figcaption>
                  <img alt="Ruutukaappaus vahvasta tunnistautumisesta" src={auth2Image} />
                </figure>
              </li>
              <li>
                <figure>
                  <figcaption>
                    Salli Sensotrend Connect -sovelluksen lukea ja kirjoittaa tietoja puolestasi
                    Omatietovarantoon.
                    </figcaption>
                  <img alt="Ruutukaappaus Omatietovarannon luvituksesta" src={consentImage} />
                </figure>
              </li>
              <li>
                <figure>
                  <figcaption>
                    Syötä käyttäjätunnukseksesi sähköpostiosoitteesi, jota käytämme myös
                    tarvittaessa ollaksemme yhteydessä sinuun, esimerkiksi vakavan virhetilanteen
                    tai tietovuodon yhteydessä. Syötä myös itse valitsemasi salasana.
                    </figcaption>
                  <img alt="Ruutukaappaus sähköpostiosoitteen kysymisestä" src={emailRegImage} />
                </figure>
              </li>
            </ol>
            <p>
              Saat seuraavaksi sähköpostiisi viestin, jossa pyydetään varmistamaan osoite. Pyydämme
              tätä varmistaaksemme, että osoite on kirjoitettu oikein ja että lähettämämme viestit
              tulevat tarvittaessa perille.
            </p>
            <p>
              Vahvisteta osoitteesi klikkaamalla viestissä olevaa linkkiä. Tällöin selaimesi
              pitäisi tuoda sinut takaisin palveluun. Mikäli näin ei käy, voit kopioida osoitteen
              sähköpostista selaimesi osoiteriville. 
            </p>
            <p>
              Vahvistettuasi sähköpostiosoitteesi tunnuksesi on aktivoitu.
            </p>
            <p>
              Voit käyttää luomaasi käyttäjätunnusta ja salasanaa <a
              href="#SensotrendUploader">Sensotrend Uploader</a> - ja <a
              href="#SensotrendMobileMedtronicUploader">Sensotrend Mobile Medtronic Uploader</a> -
              sovellusten kanssa.
            </p>
            <p>
              Voit nyt kirjautua ulos palvelusta <strong>Poistu</strong>-valinnan avulla.
            </p>

            <h3 id="settings">Asetusten muokkaaminen</h3>
            <p>
              Voit koska tahansa muokata rekisteröimääsi sähköpostiosoitetta ja siihen liittyviä
              asetuksiasi.
            </p>
            <ol>
              <li>Aloita kirjautumalla Omatietovarantoon kuten <a href="#signin">yllä</a>.</li>
              <li>
                <figure>
                  <figcaption>
                    Päädyttyäsi takaisin Sensotrend Connect -näkymään,
                      valitse <strong>Asetukset</strong>.
                    </figcaption>
                  <img alt="Ruutukaappaus palvelun päänäkymästä" src={settingsImage} />
                </figure>
              </li>
              <li>
                <figure>
                  <figcaption>
                    Asetukset-näkymässä pääset vaihtamaan rekisteröimääsi sähköpostiosoitetta ja
                    salasanaasi sekä asetuksiasi postin käyttämiseksi.
                  </figcaption>
                  <img alt="Ruutukaappaus palvelun Asetukset-näkymästä" src={preferencesImage} />
                </figure>
              </li>
            </ol>
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
            </p>
            <ol>
              <li>Aloita kirjautumalla Omatietovarantoon kuten <a href="#signin">yllä</a>.</li>
              <li>
                <figure>
                  <figcaption>
                    Päädyttyäsi takaisin Sensotrend Connect -näkymään,
                    valitse <strong>Asetukset</strong>.
                  </figcaption>
                  <img alt="Ruutukaappaus palvelun päänäkymästä" src={settingsImage} />
                </figure>
              </li>
              <li>
                <figure>
                  <figcaption>
                    Asetukset-näkymässä valitse <strong>Poista tili</strong> ja vahvista
                    valintasi.
                  </figcaption>
                  <img alt="Ruutukaappaus palvelun Asetukset-näkymästä" src={removeImage} />
                </figure>
              </li>
            </ol>
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
              osallistumaan kehitykseen <a
                href="https://github.com/Sensotrend/nightscout-fi">GitHubissa</a>.
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
        <section id="productinfo">
          <div className="container">
            <h2>Tuotetiedot</h2>
            <div>
              <img src={ceImage} alt="CE" />
              <p>
                Sensotrend Connect on luokan I lääkinnällinen laite. Ks. <a
                  href={`${
                    process.env.PUBLIC_URL
                    }/EU_Declaration_of_Conformity_-_Sensotrend_Connect.pdf`}>
                  vaatimustenmukaisuusvakuutus
                </a>.
              </p>
            </div>
            <div>
              <img src={manufacturerImage} alt="Valmistaja" />
              <address>
                Sensotrend Oy<br />
                Tampellan esplanadi 19 A 55<br />
                33180 Tampere<br />
              </address>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default Instructions;
