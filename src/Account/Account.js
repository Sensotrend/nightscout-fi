import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import Octicon, { ArrowLeft, CloudUpload, SignOut } from '@githubprimer/octicons-react';

import ActionsMenu from '../Actions/ActionsMenu';
import { server } from '../Api/Api';
import EmailForm from '../EmailVerification/EmailForm';
import ParallaxComponent from '../Parallax/ParallaxComponent';
import { fetchConfig } from '../Routes/Routes';


class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDeleting: false,
      error: undefined,
    };
  }

  deleteAccount = (e) => {
    window.setTimeout(() => {
      const confirmed = window.confirm('Tahdotko varmasti poistaa kaikki tietosi ja lopettaa palvelun käytön?');
      if (confirmed) {
        this.setState({
          isDeleting: true,
          error: undefined,
        });
        e.preventDefault();
        fetch(`${server}/api/deleteuser`, {
          ...fetchConfig,
          method: 'DELETE',
        })
        .then(() => {
          this.setState({
            isDeleting: false,
            error: undefined,
          });
        })
        .catch(error => {
          this.setState({
            isDeleting: false,
            error,
          });
        });
      }
    }, 0);
  }

  render() {
    const { config, history } = this.props;
    const { isDeleting, sent } = this.state;
    console.log('Account props', this.props);

    return (
      <main id="account">
        <Formik
          initialValues={{
            email: '',
            notifications: false,
            development: false,
            ...config,
          }}
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
            // TODO: modify the endpoint, or add a new one...
            return fetch(`${server}/emailverification/sendverificationrequest`, {
              ...fetchConfig,
              method: 'POST',
              body: JSON.stringify(values),
            }).catch((error) => {
              this.setState({
                error,
              })
              // TODO: visualize this better!
              console.error(error);
            }).then(() => {
              setSubmitting(false);
              this.setState({
                sent: true,
              })
            });
          }}
        >
          {({ isSubmitting, dirty, values, handleReset, handleSubmit, props }) => (
            <form onReset={handleReset} onSubmit={handleSubmit} {...props}>
              <ParallaxComponent>
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
                <section id='secrets'>
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
              </ParallaxComponent>
              <ActionsMenu>
                {sent
                  ? (
                    <p>Tarkista sähköpostisi!</p>
                  )
                  : (
                    <Fragment>
                      <button
                        type="button"
                        onClick={() => {
                          history.goBack();
                        }}
                      >
                        <Octicon icon={ArrowLeft} verticalAlign="middle" size="medium" />
                        <span>Takaisin</span>
                      </button>
                      <button
                        type="submit"
                        className="success"
                        disabled={!dirty || isSubmitting || isDeleting}
                        onClick={(e) => {
                          console.log('submitting form...');
                          handleSubmit(e);
                        }}
                      >
                        <Octicon icon={CloudUpload} verticalAlign="middle" size="medium" />
                        <span>Tallenna</span>
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={isSubmitting || isDeleting}
                        onClick={this.deleteAccount}
                      >
                        <Octicon icon={SignOut} verticalAlign="middle" size="medium" />
                        <span>Poista tili</span>
                      </button>
                    </Fragment>
                  )
                }
              </ActionsMenu>
            </form>
          )}
        </Formik>
      </main>
    );
  }
}

export default Account;
