import React, { Component } from 'react';

import Header from '../Header/Header';

class Shutdown extends Component {
  render() {
    return (
      <main id='shutdown'>
        <Header />
        <section id="end-of-story">
          <div className="container">
            <h1>Palvelun tarina päättyy</h1>
            <p className="ingress">Nightscout Connect -palvelu on mahdollistanut
              Nightscout-sovellusten käytön Kanta-järjestelmän Omatietovarannon yhteydessä.
              Palvelun toiminta kuitenkin loppuu lähitulevaisuudessa.</p>
          </div>
        </section>
        <section id="nightscout-connect">
          <div className="container">
            <h2>Mikä Nightscout Connect?</h2>
            <p>Nightscout on avoimen lähdekoodin kehittäjäyhteisö, joka kehittää innovatiivisia
              palveluita verensokerin etäseurantaan ja jopa automatisoituun insuliinin annosteluun.
              Yhteisössä on satoja sovelluskehittäjiä ja tuhansia vapaaehtoisia, jotka parantavat
              palveluiden käyttöohjeita ja auttavat toisia ihmisiä palveluiden käyttöönotossa.</p>
            <p>Nightscout Connect -palvelun idea oli tarjota Nightscout-rajapinta
              Kanta-järjestelmän Omatietovarannon yhteydessä. Tällöin palvelun käyttöönotto
              helpottuu, kun sovelluksia käyttävän ihmisen tai perheen ei enää tarvitse pystyttää
              omaa palvelinympäristöä. Tarkoitus oli myös helpottaa sovellusten käsittelemien
              tietojen jakamista lääkärin ja hoitajan kanssa.</p>
            <p>Palvelun tarina alkoi Sosiaali- ja terveysministeriön vuonna 2017 julkistamasta
              suunnittelukilpailusta. Kilpailussa valittiin kolme voittajaa integroitaviksi
              Omatietovarantoon. Nightscout.fi-palvelu oli yksi näistä kolmesta ja ainoa, joka
              integraation lopulta toteutti loppuun saakka.</p>
            <p>Työstimme kilpailutyötä varten videon, joka tiivistää palvelun idean. Itse video ei
              lopulta edes ehtinyt mukaan kilpailutyöhön, mutta julkistettakoon se nyt tässä.</p>
          </div>
        </section>
        <section id="nightscout-connect-video">
          <div className="container">
            <div className="video">
              <iframe width="100%" src="https://www.youtube-nocookie.com/embed/3rNMwO_KU1I"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
            </div>
          </div>
        </section>
        <section id="reasons">
          <div className="container">
            <h2>Palvelun loppumisen syyt</h2>
            <p>Nyt palvelun toiminta on siis kuitenkin päättymässä. Avaamme tässä tilanteen
              taustoja. Lopuksi kerromme, mitä tämä tarkoittaa palvelun nykyisille käyttäjille.</p>
            <p>Syy sille, miksi palvelun toiminta loppuu juuri nyt on se, että äskettäin voimaan
              tullut asiakastietolaki ja sitä täydentävät THL:n määräykset asettavat uusia
              vaatimuksia Omatietovarantoon liittyville sovelluksille. Näitä uusia vaatimuksia ovat
              esimerkiksi saavutettavuusselvitykset ja tietoturvallisuuden auditointi ulkopuolisen
              tahon toimesta. Sekä saavutettavuus että tietoturva ovat kiistatta tärkeitä asioita,
              jotka kaikkien verkkopalveluiden täytyy hoitaa kuntoon. Uudet määräykset keskittyvät
              lähinnä siihen, kuinka nämä asiat dokumentoidaan ulkopuolisille ja varmennetaan
              ulkopuolisten toimijoiden toimesta. Tämän dokumentaation tuottaminen aiheuttaisi
              paljon uutta työtä ja lisäksi pelkistä auditointimaksuistakin kertyy vähintään
              viisinumeroinen summa.</p>
            <p>Suurempi syy palvelun toiminnan loppumiselle, ja pääasiallinen syy sille, että emme
              lähde täyttämään uusia vaatimuksia on kuitenkin se, että Omatietovaranto
              palveluympäristönä on ollut meille massiivinen pettymys ja ylipäätäänkin kiistatta
              katastrofaalinen epäonnistuminen.</p>
            <p>Omatietovarannon oli tarkoitus toimia ekosysteeminä, jossa kansalainen voi
              hallinnoida itse tuottamiaan terveys- ja hyvinvointitietoja ja jonka avulla
              kansalainen voi jakaa tietoja eri hyvinvointisovellusten kesken ja myös
              terveydenhuollon ammattilaisille. Nyt, lähes seitsemän vuotta palvelun lanseeraamisen
              jälkeen palveluun on liittyneenä neljä eri sovellusta. Kaksi niistä (Nightscout
              Connect ja Sensotrend Connect) ovat saman sovellustoimittajan toteuttamia. Eri
              toimittajien sovellukset eivät millään tavoin jaa tietoja keskenään, eikä
              Omatietovaranto millään tavalla helpota tietojen jakamista terveydenhuollon
              ammattilaisten kanssa - pikemminkin vain hankaloittaa sitä.</p>
            <p>Verensokerin etäseurantapalvelusta hyötyvät kaikkein eniten diabetesta sairastavien
              lasten perheet ja nämä perheet olivat alusta saakka meille tärkein kohderyhmä.
              Kilpailutyössämme ja sen jälkeisissä sopimusneuvotteluissa nostimme esiin suurimpana
              riskinä sen, että Omatietovarannossa ei tuolloin ollut mahdollista käsitellä lasten
              tietoja. Kaikki osapuolet pitivät tuolloin kuitenkin selvyytenä sitä, että tuo
              ominaisuus on tulossa ja kyse oli vain toteutuksen aikataulusta. Nyt on jo ilmeistä,
              että Kelalla ei ole mitään aikomusta laajentaa Omatietovarannon käyttöä kattamaan
              pienten lasten tietoja, vaan Omatietovarantoon voi perustaa tilin ainoastaan
              henkilölle, jolla on omat henkilökohtaiset sähköiset tunnistautumisvälineet.</p>
            <p>Kaikki muukin kehitys Omatietovarannossa on ollut hyvin hidasta ja tuskallista.
              Mikäli tilanne muuttuu tulevaisuudessa, voimme edelleen harkita palvelun uudelleen
              aktivointia. Mutta tällä hetkellä mikään ei viittaa siihen, että Omatietovarannosta
              tulisi hyvinvointisovelluksille elinkelpoinen ekosysteemi.</p>
          </div>
        </section>
        <section id="effects">
          <div className="container">
            <h2>Mitä tämä tarkoittaa käytännössä?</h2>
            <p>Tämä ei ole meillekään vielä täysin selvää. THL:n määräyksessä Omatietovarantoon
              liittyneille sovelluksille asetetaan uusien vaatimusten täyttämiselle määräaika
              1.1.2023, <q
              cite="https://thl.fi/documents/920442/2816495/THL_maarays_6_2021_hyvinvointisovellusten_vaatimukset.pdf/7efc2543-1093-43b6-9509-c9bdfeee40c7?t=1645085233307">johon
              mennessä sille on suoritettava tämän määräyksen mukainen sertifiointi ja
              rekisteröinti.</q> Meillä ei kuitenkaan ole tarkempaa tietoa siitä, pitäisikö meidän
              jotenkin purkaa tuo liitos ja kuinka se tapahtuisi, vai huolehtiiko Omatietovaranto
              siitä, että palvelu ei enää toimi.</p>
            <p>Mitään tietoja ei varsinaisesti katoa. Omatietovarantoon jo tallentuneet tiedot
              tulevat säilymään siellä. Samoin Nightscout Connect -palveluun tallennetut
              yhteystiedot pysyvät palvelussa tallessa.</p>
            <p>Käsityksemme mukaan tietojen siirto kuitenkin lakkaa toimimasta. Tämä tarkoittaa,
              että joko heti ensi vuoden alusta tai jonakin ajankohtana sen jälkeen tiedot eivät
              enää siirry Nightscout-sovelluksista Omatietovarantoon eivätkä Omatietovarannosta
              Nightscout-sovelluksiin.</p>
          </div>
        </section>
        <section id="todo">
          <div className="container">
            <h2>Kuinka Nightscout-sovellusten käyttöä voi jatkaa?</h2>
            <p>Kun Omatietovarantoa ei enää voi käyttää tietojen tallentamiseen ja jakamiseen,
              Nightscout-sovelluksille tarvitaan erillinen asennus. </p>
            <p>Perinteisesti asennus on tehty Heroku-ympäristöön. Tämä onnistuu suoraan koodin
              versionhallintajärjestelmästä Deploy to Heroku-nappulan kautta. Tämä menetelmä
              edellyttää rekisteröitymistä useampaan eri palveluun ja jonkin verran eri
              työvaiheita. Kymmenet tuhannet ei-tekniset ihmiset ovat kuitenkin tässä onnistuneet,
              eli pelko pois. Tukea saa tarvittaessa Facebookin vertaistukiryhmistä. Tämä tapa on
              ennen ollu ilmainen, mutta Herokusta poistui vastikään ilmaiskäytön mahdollisuus.
              Arvio Nightscout-käytön kuluista maksullisessa Herokussa on n. 5 € / kk.</p>
            <p>Toinen vaihtoehto on käyttää palveluita, jotka tarjoavat Nightscout-ympäristön
              palveluna, samaan tapaan kuin Nightscout Connect tarjosi. Tällaisia palveluita ovat
              ainakin <a href="https://t1pal.com/">T1Pal</a> ja <a
              href="https://ns.10be.de">ns.10be.de</a>. Näiden palveluiden avulla
              Nightscout-asennuksen käyttöönotto on helpompaa, mutta edellyttää joko englannin tai
              saksan kielen taitoa. Myös näillä palveluilla on pieni kuukausittainen
              käyttömaksu.</p>
            <p>Mikäli olet jakanut tietojasi terveydenhuollon ammattilaiselle Omatietovarannosta
              Sensotrend Connect - tai Sensotrend Dashboard -sovellusten kautta, tämä on
              mahdollista myös jatkossa, suoraan Nightscout-palvelustasi. Liitä vain Nightscout
              tietolähteeksi Sensotrend Dashboard -sovelluksessa.</p>
          </div>
        </section>
        <section id="thankyou">
          <div className="container">
            <h2>Kiitokset</h2>
            <p>Lopuksi kiitokset kaikille tarinan osapuolille!</p>
            <p>Kiitokset kaikille teille, jotka ovat palvelua käyttäneet.</p>
            <p>Suuri kiitos myös kaikille teille, jotka olette antaneet palautetta ja
              kehitysideoita! Uskoaksemme olemme pystyneet vastaamaan lähes kaikkiin niistä.</p>
            <p>Erityisen suuret kiitokset Sosiaali- ja terveysministeriölle rohkeasta kokeilusta
              sekä Omatietovarannon edistämisen että etenkin suunnittelukilpailun osalta. Te
              mahdollistitte tämän palvelun syntymisen ja toimimisen tähän saakka. Jos ei mitään
              yritä, ei voi onnistuakaan. Toisaalta on hyvä huomata, milloin on yritetty riittävästi
              ja on aika luovuttaa. Tämä hetki tuli meidän palvelumme osalta eteen nyt.</p>
            <p>Aivan erityinen kiitos kuuluu tietysti Nightscout-yhteisölle, jonka luomat
              sovellukset jatkossakin helpottavat elämää diabeteksen kanssa ja jonka aktiivisuus ja
              anna hyvän kiertää -asenne luovat kaikesta huolimatta uskoa tulevaisuuteen!</p>
          </div>
        </section>
        <section />
      </main>
    );
  }
}

export default Shutdown;
