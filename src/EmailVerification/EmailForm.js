import React, { Component, Fragment } from 'react';
import { Field, ErrorMessage } from 'formik';

import Checkbox from './Checkbox';

class EmailForm extends Component {
  /*
  createEmail = ({ email, notifications, development }) => {
    // TODO: implement a different endpoint!
    return fetch(`${server}/emailverification/sendverificationrequest`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ email, notifications, development }),
    })
  }

  editEmail = ({ email, notifications, development }) => {
    // TODO: implement a different endpoint!
    return fetch(`${server}/emailverification/sendverificationrequest`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ email, notifications, development }),
    })
  }

  storeSettings = ({ email, notifications, development }) => {
    // TODO: implement a different endpoint!
    return fetch(`${server}/emailverification/sendverificationrequest`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ email, notifications, development }),
    })
  }

  handleInputChange = (event) => {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value
    });
  }

  submit = (e) => {
    this.setState({
      status: 'sending',
      error: undefined,
    });
    e.preventDefault();
    const { email, notifications, development } = this.state;
    const emailEdited = email !== this.props.email;
    let apiCall;
    if (emailEdited) {
      let c;
      if (!this.props.email) {
        // Need to create a new address
        c = this.createEmail;
      } else {
        // Modify an existing email address
        c = this.editEmail;
      }
      apiCall = () => c({ email, notifications, development });
    } else {
      // Just store the new settings
      // TODO: use a new API endpoint, once it is available.
      apiCall = () => this.storeSettings({ email, notifications, development });
    }
    apiCall()
      .then(() => {
        this.setState({
          status: 'sent',
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
  */

  render() {
    const { config } = this.props;
    console.log('Form props', config);
    return (
      <Fragment>
        <p>Tarvitsemme sähköpostiosoitteesi voidaksemme tiedottaa kriittisistä vikatilanteista
          palvelussa.</p>
        <p>Voit halutessasi saada sähköpostiosoitteeseesi myös tietoja palvelun vähemmän
          kriittisistä virhetilanteista.</p>
        <p>Voit myös ilmaista halusi osallistua palvelun jatkokehitykseen.</p>
        <p><a href="privacy">Tietosuojaseloste</a> kertoo tarkemmin tietojesi käytöstä.</p>
        <table>
            <tbody>
              <tr>
                <th>Sähköposti</th>
              </tr>
              <tr>
                <td>
                  <Field
                    type="email"
                    name="email"
                    placeholder="sahkopostiosoite@palvelin.com"
                  />
                  <ErrorMessage name="email" component="div" />
                </td>
              </tr>
              <tr>
                <td>
                  <div className="checkbox">
                    <Checkbox
                      name="notifications"
                      id="notifications"
                    />
                    <label htmlFor="notifications">Tahdon saada sähköpostiini tietoja palvelun
                vikatilanteista (esimerkiksi verkkoyhteyden tilapäinen katkeaminen).</label>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="checkbox">
                    <Checkbox
                      name="development"
                      id="development"
                    />
                    <label htmlFor="development">Minulle saa lähettää viestejä ja kysymyksiä liittyen
                palvelun jatkokehitykseen</label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
      </Fragment>
    );
  }
}

EmailForm.defaultProps = {
  config: {
    email: '',
    notifications: false,
    development: false,
  },
};

export default EmailForm;
