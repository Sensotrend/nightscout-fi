import React, { Component } from 'react';

import { server } from '../Api/Api';
import EmailForm from './EmailForm';
import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';

class EmailRequest extends Component {
  render() {
    return (
      <main id="registration">
        <form method="POST" action={`${server}/emailverification/sendverificationrequest`}>
          <ParallaxComponent>
            <section id="email">
              <div className="container">
                <h2>Rekisteröityminen</h2>
                <EmailForm />
              </div>
            </section>
          </ParallaxComponent>
          <ActionsMenu>
            
          </ActionsMenu>
        </form>
      </main>
    );
  }
}

export default EmailRequest;
