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

    return (
      <main id="registration">
        <Formik
          initialValues={{
            email: '',
            notifications: false,
            development: false,
            ...config,
          }}
          validate={values => {
            console.log('VALIDATING form values', values);
            let errors = {};
            if (!values.email) {
              errors.email = 'Syötä sähköpostiosoitteesi';
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = 'Sähköpostiosoite on virheellinen';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            return fetch(`${server}/emailverification/sendverificationrequest`, {
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
            <form method="POST" action={`${server}/emailverification/sendverificationrequest`}>
              <ParallaxComponent>
                <section id="email">
                  <div className="container">
                    <h2>Rekisteröityminen</h2>
                    <EmailForm />
                    <p>Kun lähetät lomakkeen, lähetämme sinulle vahvistusviestin, jossa olevaa
                      linkkiä klikkaamalla saat palvelun käyttöösi.
                    </p>
                  </div>
                </section>
              </ParallaxComponent>
              <ActionsMenu>
                {sent
                  ? (
                    <p>Tarkista sähköpostisi!</p>
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
                      <span>Lähetä</span>
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
