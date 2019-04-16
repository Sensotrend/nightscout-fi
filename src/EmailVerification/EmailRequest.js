import React, { Component, Fragment } from 'react';

import EmailForm from './EmailForm';

class EmailRequest extends Component {
  render() {
    return (
      <div id="registration">
        <h2>Rekisteröityminen</h2>
        <EmailForm />
      </div>
    );
  }
}

export default EmailRequest;
