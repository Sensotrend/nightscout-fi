import React, { Component } from 'react';
import qs from 'query-string';

import { server } from '../Api/Api';
import ConsentForm from './ConsentForm';
import ActionsMenu from '../Actions/ActionsMenu';
import ParallaxComponent from '../Parallax/ParallaxComponent';
import { fetchConfig } from '../Routes/Routes';

class ConsentError extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false,
    };
  }

  render() {
    let { config } = this.props;
    const { sent } = this.state;

    const {  message } = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });

    console.log("ERROR");

    return (
      <main id="registration">
        <ParallaxComponent>
                <section id="email">
                  <div className="container">
                    <p>{message}</p>
                  </div>
                </section>
        </ParallaxComponent>
      </main>
    );
  }
}

export default ConsentError;
