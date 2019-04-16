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
    let email;
    if (editEmail) {
      const cancelButton = (
        <button
          className="button-secondary large pure-button"
          onClick={this.cancelEdit}
        >
          Peru
        </button>
      );
      email = <EmailForm cancelButton={cancelButton} />
    } else {
      email = (
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
    let account;
    switch (status) {
      case 'deleting': account = <p>Poistetaan...</p>
      break;
      case 'deleted': account = <Redirect to="/deleted" />
      break;
      default: account = (
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
          {email}
        </div>
        <div>
          {account}
        </div>
      </div>
    );
  }
}

export default Account;
