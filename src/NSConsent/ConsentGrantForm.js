import React, { Component } from 'react';
import { Formik } from 'formik';
import Octicon, { CloudUpload } from '@githubprimer/octicons-react';
import qs from 'query-string';

import { server } from '../Api/Api';
import ConsentForm from './ConsentForm';
import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';
import { fetchConfig } from '../Routes/Routes';

class ConsentGrantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false,
    };
  }

  render() {
    let { config } = this.props;
    const { sent } = this.state;

    const { grantid } = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });

    console.log("GRANT FORM");

    return (
      <main id="registration">
        <Formik
          initialValues={{
            url: '',
            secret: '',
            dataquality: false,
            ...config,
          }}
          validate={values => {
            console.log('VALIDATING form values', values);
            let errors = {};
            
            if (!values.url) {
              errors.email = 'Please enter Nightscout URL';
            }

            if (!values.secret) {
              errors.email = 'Please enter Nightscout API SECRET';
            } 
            
            console.log('values.dataquality', values.dataquality);
            if (!values.dataquality) {
              errors.dataquality = 'You must confirm you understand the potential data quality issue with Nigthscout data';
            }
            
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            let v2 = values;
            v2.grantid = grantid;
            
            return fetch(`${server}/nsconsent/grantpermission`, {
              ...fetchConfig,
              method: 'POST',
              body: JSON.stringify(v2),
            }).catch((error) => {
              // TODO: visualize this better!
              console.error(error);
            }).then((results) => {
              console.log('results', results);
              setSubmitting(false);
              if (results.status === 200) {
                this.setState({
                  sent: true,
                  });
              }
            });
          }}
        >
          {({ dirty, isSubmitting, handleSubmit }) => (
            <form method="POST" action={`${server}/nsconsent/permissionrequest`}>
              <ParallaxComponent>
                <section id="email">
                  <div className="container">
                    <h2>Permission request from your clinic</h2>
                      <ConsentForm />
                  </div>
                </section>
              </ParallaxComponent>
              <ActionsMenu>
                {sent
                  ? (
                    <p>Access granted</p>
                  )
                  : (
                    <button
                      type="submit"
                      className="success"
                      disabled={!dirty || isSubmitting}
                      onClick={(e) => {
                        handleSubmit(e);
                      }}
                    >
                      <Octicon icon={CloudUpload} verticalAlign="middle" size="medium" />
                      <span>Grant permission</span>
                    </button>
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

export default ConsentGrantForm;
