import React, { Component, Fragment } from 'react';

import { server } from '../Api/Api';
import { fetchConfig } from '../Routes/Routes';

class EmailForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.email = React.createRef();
    this.notifications = React.createRef();
    this.development = React.createRef();
  }

  submit = (e) => {
    this.setState({
      status: 'sending',
      error: undefined,
    });
    e.preventDefault();
    const data = {
      email: this.email.current.value,
      notifications: this.notifications.current.checked,
      development: this.development.current.checked,
    };
    fetch(`${server}/emailverification/sendverificationrequest`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify(data),
    })
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
    const { cancelButton, config } = this.props;
    const { email, notifications, development } = config;
    const { status, error } = this.state;
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
            { Button }
          </Fragment>
        )
      break;
      default:
        action = Button;
    }
    return (
      <Fragment>
        <p>Tarvitsemme sähköpostiosoitteesi voidaksemme tiedottaa kriittisistä vikatilanteista
          palvelussa.</p>
        <p>Voit halutessasi saada sähköpostiosoitteeseesi myös tietoja palvelun vähemmän
          kriittisistä virhetilanteista.</p>
        <p>Voit myös ilmaista halusi osallistua palvelun jatkokehitykseen.</p>
        <p><a href="privacy">Tietosuojaseloste</a> kertoo tarkemmin tietojesi käytöstä.</p>
        <form method="POST" action={`${server}/emailverification/sendverificationrequest`}>
          <div>
            <input
              type="email"
              name="email"
              id="email"
              ref={this.email}
              placeholder="sahkopostiosoite@palvelin.com"
            >
              {email}
            </input>
          </div>
          <div className="checkbox">
            <input
              type="checkbox"
              name="notifications"
              id="notifications"
              ref={this.notifications} checked={notifications}
            />
            <label htmlFor="notifications">Tahdon saada sähköpostiini tietoja palvelun
              vikatilanteista (esimerkiksi verkkoyhteyden tilapäinen katkeaminen).</label>
          </div>
          <div className="checkbox">
            <input
              type="checkbox"
              name="development"
              id="development"
              ref={this.development}
              checked={development}
            />
            <label htmlFor="development">Minulle saa lähettää viestejä ja kysymyksiä liittyen
              palvelun jatkokehitykseen</label>
          </div>
          <div>
            { cancelButton }
            { action }
          </div>
        </form>
      </Fragment>
    );
  }
}

EmailForm.defaultProps = {
  config: {},
}

export default EmailForm;