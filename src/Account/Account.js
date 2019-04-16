import React, { Component, Fragment } from 'react';
import { Link, Redirect } from 'react-router-dom';

import { server } from '../Api/Api';
import EmailForm from '../EmailVerification/EmailForm';
import { fetchConfig } from '../Routes/Routes';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  cancelEdit = (e) => {
    e.preventDefault();
    this.setState({
      editEmail: false,
    });
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

  editEmail = (e) => {
    e.preventDefault();
    this.setState({
      editEmail: true,
    });
  }

  render() {
    const { config } = this.props;
    const { editEmail, status } = this.state;
    let emailComponent;
    if (editEmail) {
      const cancelButton = (
        <button
          className="button-secondary large pure-button"
          onClick={this.cancelEdit}
        >
          Peru
        </button>
      );
      emailComponent = <EmailForm cancelButton={cancelButton} config={config} />
    } else {
      emailComponent = (
        <Fragment>
          <p>Sähköpostiosoite: {config.email}</p>
          <Link to="account">
            <button
              className="button-secondary large pure-button"
              onClick={this.editEmail}
            >
              Muokkaa
            </button>
          </Link>

        </Fragment>
      );
    }
    let accountComponent;
    switch (status) {
      case 'deleting': accountComponent = <p>Poistetaan...</p>
      break;
      case 'deleted': accountComponent = <Redirect to="/deleted" />
      break;
      default: accountComponent = (
        <a href="delete">
          <button
            className="button-warning large pure-button"
            onClick={this.deleteAccount}
          >
            Poista tili!
          </button>
        </a>
      );
    }

    return (
      <div id="account">
        <h2>Tilin asetukset</h2>
        <div>
          {emailComponent}
        </div>
        <div>
          {!editEmail && accountComponent}
        </div>
        <div>
          <Link to="/"><button className="button-secondary large pure-button">Peru</button></Link>
        </div>
      </div>
    );
  }
}

export default Account;
