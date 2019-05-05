import React, { Component, Fragment } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Formik, Form } from 'formik';

import ActionsMenu from '../Actions/ActionsMenu';
import { server } from '../Api/Api';
import EmailForm from '../EmailVerification/EmailForm';
import ParallaxComponent from '../Parallax/ParallaxComponent';
import { fetchConfig } from '../Routes/Routes';


class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  deleteAccount = (e) => {
    this.setState({
      status: 'deleting',
      error: undefined,
    });
    e.preventDefault();
    fetch(`${server}/api/deleteuser`, {
      ...fetchConfig,
      method: 'DELETE',
    })
      .then(() => {
        this.setState({
          status: 'deleted',
          error: undefined,
        });
      })
      .catch(error => {
        this.setState({
          status: 'error',
          error,
        });
      });
  }

  render() {
    const { config } = this.props;
    console.log('Account props', this.props);

    return (
      <main id="account">
        <Formik
          initialValues={config}
          validate={values => {
            console.log('VALIDATING form values', values);
            let errors = {};
            if (!values.email) {
              errors.email = 'Syötä sähköpostiosoitteesi';
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = 'Sähköpostiosoite on virheellinen';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            console.log('SUBMITTING form values', values);
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2));
              setSubmitting(false);
            }, 400);
          }}
        >
          {({ isSubmitting, dirty, values, handleReset, handleSubmit, props }) => (
            <form onReset={handleReset} onSubmit={handleSubmit} {...props}>
              <ParallaxComponent>
                <section id='email'>
                  <div className="container">
                    <h2>Tilin asetukset</h2>
                    <table>
                      <caption>
                        Voit liittää Nightscout-sovelluksia Omatietovaranto-tiliisi näillä asetuksilla:
                        </caption>
                      <tbody>
                        <tr>
                          <th>API SECRET</th>
                          <td>{config.secret}</td>
                        </tr>
                        <tr>
                          <th>REST API osoite</th>
                          <td>{`https://${config.secret}@${config.api}`}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p>Mikäli tahdot vaihtaa API SECRET -tunnuksesi, voit poistaa tilisi ja luoda
                      uuden tilin samoilla sähköpostiasetuksilla.</p>
                  </div>
                </section>
                <section id='email'>
                  <div className="container">
                    <h2>Sähköpostiasetukset</h2>
                    <EmailForm config={values} />
                  </div>
                </section>
                <section id='spacer'>
                  <div className="container">
                    &nbsp;
                  </div>
                </section>
              </ParallaxComponent>
              <ActionsMenu>
                <Link to="/"><button className="button-secondary large pure-button">Takaisin</button></Link>
                <Link to="account">
                  <button
                    type="submit"
                    className="button-secondary large pure-button"
                    disabled={isSubmitting || !dirty}
                    onClick={(e) => {
                      console.log('submitting form...');
                      handleSubmit(e);
                      e.preventDefault();
                    }}
                  >
                    Tallenna
                  </button>
                </Link>
                <a href="delete">
                  <button
                    className="button-warning large pure-button"
                    onClick={this.deleteAccount}
                  >
                    Poista tili!
                  </button>
                </a>
              </ActionsMenu>
            </form>
          )}
        </Formik>
      </main>
    );
  }
}

export default Account;
