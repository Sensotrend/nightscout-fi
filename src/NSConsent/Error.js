import React, { Component } from 'react';
import qs from 'query-string';

import ParallaxComponent from '../Parallax/ParallaxComponent';

class ConsentError extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sent: false,
    };
  }

  render() {

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
