import React, { Component, Fragment } from 'react';

import Header from '../Header/Header';
import { DescriptionText } from '../Instructions/Description';

class Eula extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <main id='eula'>
          <section>
            <div className="container">
              <h2 id="kayttoehdot">Käyttöehdot</h2>
              <small>Päivitetty 30.12.2019</small>
              <h3 id="palvelunkuvaus">Palvelun kuvaus</h3>
              <DescriptionText />
              <p>Palvelun käyttö ei korvaa tavanomaista terveytesi seurantaa tai terveydenhuollon
                ammattilaisen apua. Palvelun käsittelemistä tiedoista saattaa olla hyötyä
                havaintojen tekemisessä ja hoitotulosten analysoinnissa, mutta tietojen
                oikeellisuus tulee aina tarkistaa alkuperäisistä lähteistä. Älä koskaan tee
                muutoksia hoitoosi ottamatta ensin yhteyttä omaan diabeteshoitajaasi tai
                -lääkäriisi tai muuhun terveydenhuollon ammattilaiseen.</p>
              <h3 id="kayttoehtojensoveltaminen">Käyttöehtojen soveltaminen</h3>
              <p>Nämä käyttöehdot ovat sopimus Sinun ja palveluntuottajan (Sensotrend Oy, Y-tunnus
                2606155-7) välillä.</p>
              <p>Pyydämme Sinua lukemaan käyttöehdot huolellisesti ennen palvelun
                käyttöönottamista. Palvelun käyttäminen tarkoittaa näiden ehtojen hyväksymistä.</p>
              <p>Sensotrendillä on oikeus muuttaa käyttöehtoja. Muutokset astuvat voimaan
                ilmoitettuna ajankohtana. Kulloinkin voimassa olevat käyttöehdot ovat saatavilla
                Sensotrendin kotisivuilta tai palvelusta. Mikäli jatkat palvelun käyttöä
                käyttöehtojen muuttamisen jälkeen, sitoudut noudattamaan muutettuja
                käyttöehtoja.</p>
              <h3 id="yleisetkayttoehdot">Yleiset käyttöehdot</h3>
              <p>Käyttääksesi palvelua tulee sinun ensin rekisteröityä sen käyttäjäksi.
                Rekisteröityessäsi sitoudut antamaan vain itseäsi koskevia totuudenmukaisia tietoja
                ja käyttämään palvelua vain omien tietojesi käsittelyyn.</p>
              <p>Sensotrend ei tallenna palveluunsa terveys- eikä hyvinvointitietoja, ainoastaan
                käyttöavaimen (access token), jonka avulla tietoa voi lukea Omakannan
                Omatietovarannosta ja tallentaa sinne.</p>
              <p>Sensotrendin palvelu koostuu ohjelmistokoodista. Ohjelmistokoodeille on yleisesti
                luonteenomaista se, etteivät ne ole virheettömiä, mikä voi aiheuttaa esimerkiksi
                ajoittaisia katkoksia tai muita ongelmia, virheitä, väärinkäytöksiä tai puutteita
                palvelussa.</p>
              <p>Sensotrend pidättää itsellään oikeuden muokata palvelua tai lakkauttaa sen
                kokonaan mistä tahansa syystä milloin tahansa ilman ennakkoilmoitusta. Sensotrend
                pyrkii tiedottamaan olennaisista muutoksista tai lakkautuksista etukäteen, mutta ei
                kuitenkaan ole velvollinen siihen.</p>
              <p>Palvelu on tällä hetkellä ilmainen, mutta vastaat aina omista
                tiedonsiirtomaksuistasi. On mahdollista, että palvelu muuttuu myöhemmin
                maksulliseksi tai siihen voi tulla maksullisia lisäpalveluita. Hinnoittelusta ja
                sen muutoksista pyritään tiedottamaan hyvissä ajoin.</p>
              <p>Voit halutessasi milloin tahansa lopettaa palvelun käytön. Tällöin tietosi
                poistetaan palvelusta. Omatietovarantoon tallennetut tiedot jäävät kuitenkin sinne,
                ja ne on mahdollista poistaa Omatietovarannon oman käyttöliittymän kautta. Mikäli
                väärinkäyttötapauksia tai lain tai moraalin vastaista käyttöä ilmenee, myös
                Sensotrend voi estää palvelun käytön.</p>
              <p>Sensotrend-palvelun tietojen ja aineistojen tekijänoikeudet kuuluvat Sensotrend
                Oy:lle ja sen työntekijöille, ellei toisin mainita. Sivuston sisältöjen
                kaupalliseen käyttöön tarvitaan Sensotrend Oy:ltä etukäteen saatu lupa. Kysymykset
                ja yhteydenotot aineistojen käytön suhteen voi lähettää osoitteeseen <a
                href="info@sensotrend.com">info@sensotrend.com</a>.</p>
              <p>Palvelu voi sisältää linkkejä kolmansien osapuolien ylläpitämiin
                internet-sivustoihin ja kolmansien osapuolien tuottamiin materiaaleihin ja
                sovelluksiin. Sensotrend Oy ei ole vastuussa mistään näiden sivustojen tai
                aineistojen sisällöstä, jollei toisin mainita.</p>
              <h3 id="henkilotiedotjatietosuoja">Henkilötiedot ja tietosuoja</h3>
              <p>Sensotrendin tietosuojaseloste on voimassa olevan tietosuoja-asetuksen (GDPR)
                mukainen. Henkilötietojen suojaamisessa noudatetaan Sensotrendin
                henkilötietosuojakäytäntöä.</p>
              <p>Tietosuojaseloste on nähtävissä nightscout.fi-sivustolla, ja Sinulla on oikeus
                tarkistaa itseäsi koskevat henkilötiedot tietosuoja-asetuksen mukaisesti.</p>
              <p>Tiedoistasi saattaa joskus olla hyötyä esimerkiksi tutkimuskäytössä. Mikäli
                tällaisia käyttötarkoituksia ilmenee, kysymme aina ensin Sinulta lupaa tietojesi
                luovuttamiseen. Mitään tietojasi ei luovuteta ilman lupaasi.</p>
              <h3 id="vastuunrajoitukset">Vastuunrajoitukset</h3>
              <p>Sinulle asiakkaana kuuluvat aina Suomen pakottavan lainsäädännön mukaiset
                oikeudet. Lainsäädännön sallimissa puitteissa Sensotrendin palvelu luovutetaan
                käytettäväksi sellaisena kuin sitä kulloinkin tuotetaan, ilman Sensotrendin
                antamaa takuuta sen virheettömyydestä, täydellisyydestä tai luotettavuudesta.
                Missään olosuhteissa Sensotrend ei vastaa Sinulle aiheutuvista välittömistä tai
                välillisistä vahingoista.</p>
              <p>Palvelu pyritään toteuttamaan käyttäen yleisesti tietoturvallisiksi tunnettuja
                teknisiä ratkaisuja. Sensotrend ei vastaa palveluun liittämiesi tietolähteiden
                toiminnasta tai tietojen oikeellisuudesta. Perehdy aina kunkin palvelun omiin
                käyttöehtoihin ennen käytön aloittamista. Avoimen tietoverkon käyttö sisältää
                tietoturvallisuuteen liittyviä riskejä. Vastaat aina itse palvelun käytössä
                tarvitsemiesi päätelaitteiden tietoturvasta ja suojauksesta sekä käyttäjätunnuksien
                ja salasanojen turvallisesta säilyttämisestä.</p>
              <p>Palvelu on tarkoitettu osaksi diabeteksen omahoidon helpottamiseen ja tukemiseen
                käytettyjä ratkaisuja, mutta se ei koskaan korvaa ammattilaisten antamaa hoitoa.
                Sensotrend ei vastaa palvelun välittämien tietojen oikeellisuudesta. Tarkista aina
                tiedot niiden alkuperäisistä lähteistä, ennen kuin teet mitään muutoksia hoitoosi.
                Älä koskaan tee muutoksia hoitoosi neuvottelematta ensin oman hoitohenkilökuntasi
                kanssa.</p>
              <h3 id="kayttoehtojenjapalvelunmuutokset">Käyttöehtojen ja palvelun muutokset</h3>
              <p>Palvelua kehitetään ja sen toiminnallisuutta ja sisältöä muokataan ja parannetaan
                jatkuvasti. Sensotrend varaa oikeuden milloin tahansa muuttaa aineistoa ja palvelun
                käyttöehtoja, saatavuutta taikka muita sen ominaisuuksia oman harkintansa
                mukaan.</p>
              <p>Mikäli et hyväksy muuttuneita käyttöehtoja, voit lopettaa palvelun käytön milloin
                tahansa. Jatkamalla palvelun käyttöä ehtomuutoksen voimaanastumisen jälkeen
                sitoudut uusiin ehtoihin. Tarkista kulloinkin voimassaolevat käyttöehdot
                palvelusta.</p>
              <h3 id="sovellettavalakijaerimielisyyksienratkaisu">
                Sovellettava laki ja erimielisyyksien ratkaisu
              </h3>
              <p>Palvelun käyttämiseen ja näihin käyttöehtoihin sovelletaan Suomen lakia
                kansainvälistä lainvalintaa koskevista säännöistä ja periaatteista riippumatta.</p>
              <p>Sopimuksesta mahdollisesti aiheutuvat erimielisyydet ratkaistaan ensisijaisesti
                sopimusosapuolten välisillä neuvotteluilla. Jos neuvottelemalla ei ole päästy
                ratkaisuun 30 vuorokauden kuluessa siitä kun toinen osapuoli on tehnyt kirjallisen
                ehdotuksen neuvottelujen aloittamisesta, toisella osapuolella on oikeus viedä asia 
                Pirkanmaan käräjäoikeuden ratkaistavaksi.</p>
            </div>
          </section>
        </main>
      </Fragment>
    );
  }
}

export default Eula;
