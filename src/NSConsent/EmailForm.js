import React, { Component, Fragment } from 'react';
import { Field, ErrorMessage } from 'formik';

import Checkbox from './Checkbox';

class EmailForm extends Component {
  
  render() {
    const { config } = this.props;
    console.log('Form props', config);
    return (
      <Fragment>
        <p>This patient has not granted you access to his or her Nightscout view. Please request a permission by sending a permission request to the patient's email using the following form.</p>
        <table>
            <tbody>
              <tr>
                <th>Email</th>
              </tr>
              <tr>
                <td>
                  <Field
                    type="email"
                    name="email"
                    placeholder="email@server.com"
                  />
                  <ErrorMessage name="email" component="div" />
                </td>
              </tr>
              <tr>
                <td>
                  <div className="checkbox">
                    <Checkbox
                      name="dataquality"
                      id="dataquality"
                    />
                    <label htmlFor="notifications">I understand the information shown in Nightscout
                    can be sourced from devices not CE marked for medical purposes</label>
                    <ErrorMessage name="dataquality" component="div" />
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
    dataquality: false
  },
};

export default EmailForm;
