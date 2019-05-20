import React, { Component, Fragment } from 'react';
import { Field, ErrorMessage } from 'formik';
import qs from 'query-string';

import Checkbox from './Checkbox';

class ConsentForm extends Component {
  
  constructor(props) {
    super(props);
  }

  render() {

    const { config } = this.props;

    console.log('Form props', config);
    return (
      <Fragment>
        <p>
        Your clinic has requested permission to access your Nightscout instance.
                      If you haven't been pre-informed about this request, please get in touch
                      with your clinic and ensure this has been sent intentionally.
          </p>
        <table>
            <tbody>
              <tr>
                <th>Nightscout Address and Secret</th>
              </tr>
              <tr>
                <td>
                  <Field
                    type="email"
                    name="url"
                    placeholder="https://yoursite.heroku.com/"
                  />
                  <ErrorMessage name="url" component="div" />
                </td>
              </tr>
              <tr>
                <td>
                  <Field
                    type="email"
                    name="secret"
                    placeholder="your_api_secret"
                  />
                  <ErrorMessage name="secret" component="div" />
                </td>
              </tr>
              <tr>
                <td>
                  <div className="checkbox">
                    <Checkbox
                      name="dataquality"
                      id="dataquality"
                    />
                    <label htmlFor="notifications">I hereby grant access for my clinic to view my Nightscout instance
                    and use the information for healthcare purposes</label>
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

ConsentForm.defaultProps = {
  config: {
    url: '',
    secret: '',
    dataquality: false
  },
};

export default ConsentForm;
