import React, { Component, Fragment } from 'react';

import { server } from '../Api/Api';
import { fetchConfig } from '../Routes/Routes';

class EmailForm extends Component {
  constructor(props) {
    super(props);
    const { config } = this.props;
    const { email = '', notifications = false, development = false } = config;
    this.state = { email, notifications, development };
  }

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

  render() {
    const { cancelButton } = this.props;
    const { email, notifications, development, status, error } = this.state;
    const Button = (
      <button
        className="large primary button-success"
        type="submit"
        onClick={this.submit}
      >
        Lähetä!
      </button>
    );

    let action;
    switch (status) {
      case 'sending': 
        action = (<p>Lähetetään...</p>)
      break;
      case 'sent': 
        action = (<p>Tarkista sähköpostisi.</p>)
      break;
      case 'error':
        action = (
          <Fragment>
            <p className="error">{error.message}</p>
            { cancelButton }
            { Button }
          </Fragment>
        );
      break;
      default:
        action = (
          <Fragment>
            { cancelButton }
            { Button }
          </Fragment>
        );
    }
    return (
      <Fragment>
        <p>Tarvitsemme sähköpostiosoitteesi voidaksemme tiedottaa kriittisistä vikatilanteista
          palvelussa.</p>
        <p>Voit halutessasi saada sähköpostiosoitteeseesi myös tietoja palvelun vähemmän
          kriittisistä virhetilanteista.</p>
        <p>Voit myös ilmaista halusi osallistua palvelun jatkokehitykseen.</p>
        <p><a href="privacy">Tietosuojaseloste</a> kertoo tarkemmin tietojesi käytöstä.</p>
        { status !== 'sent' &&
          <form method="POST" action={`${server}/emailverification/sendverificationrequest`}>
            <div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="sahkopostiosoite@palvelin.com"
                value={email}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="checkbox">
              <input
                type="checkbox"
                name="notifications"
                id="notifications"
                checked={notifications}
                onChange={this.handleInputChange}
              />
              <label htmlFor="notifications">Tahdon saada sähköpostiini tietoja palvelun
                vikatilanteista (esimerkiksi verkkoyhteyden tilapäinen katkeaminen).</label>
            </div>
            <div className="checkbox">
              <input
                type="checkbox"
                name="development"
                id="development"
                checked={development}
                onChange={this.handleInputChange}
              />
              <label htmlFor="development">Minulle saa lähettää viestejä ja kysymyksiä liittyen
                palvelun jatkokehitykseen</label>
            </div>
            <div>
              { action }
            </div>
          </form>
        }
      </Fragment>
    );
  }
}

EmailForm.defaultProps = {
  config: {},
}

export default EmailForm;
