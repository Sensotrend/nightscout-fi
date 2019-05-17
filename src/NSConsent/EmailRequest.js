import React, { Component } from 'react';
import { Formik } from 'formik';
import Octicon, { CloudUpload } from '@githubprimer/octicons-react';

import { server } from '../Api/Api';
import EmailForm from './EmailForm';
import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';
import { fetchConfig } from '../Routes/Routes';

class EmailRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false,
    };
  }

  render() {
    const { config } = this.props;
    const { sent } = this.state;

    console.log("REQUEST FORM");

    return (
      <main id="registration">
        <Formik
          initialValues={{
            email: '',
            dataquality: false,
            ...config,
          }}
          validate={values => {
            console.log('VALIDATING form values', values);
            let errors = {};
            if (!values.email) {
              errors.email = 'Please enter the email address';
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = 'Email address is invalid';
            }
            console.log('values.dataquality', values.dataquality);
            if (!values.dataquality) {
              errors.dataquality = 'You must confirm you understand the potential data quality issue with Nigthscout data';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            return fetch(`${server}/nsconsent/permissionrequest`, {
              ...fetchConfig,
              method: 'POST',
              body: JSON.stringify(values),
            }).catch((error) => {
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
          {({ dirty, isSubmitting, handleSubmit }) => (
            <form method="POST" action={`${server}/nsconsent/permissionrequest`}>
              <ParallaxComponent>
                <section id="email">
                  <div className="container">
                    <h2>Need to request access permission</h2>
                    <EmailForm />
                    <p>After submitting the request, the patient should read his/her email
                      and follow the instructions on how to grant you access.
                    </p>
                  </div>
                </section>
              </ParallaxComponent>
              <ActionsMenu>
                {sent
                  ? (
                    <p>Email sent, please have the patient check his/her email!</p>
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
                      <span>Send</span>
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

export default EmailRequest;
