import React, { Component } from 'react';

import Login from '../Login/Login';
import Settings from '../Settings/Settings';
import ParallaxComponent from '../Parallax/ParallaxComponent';

class Index extends Component {
  render() {
    const { config } = this.props;
    return (
      <main id="index">
        {(config && config.secret && config.api)
          ? <Settings config={config} />
          : <Login />
        }
      </main>
    );
  }
}

export default Index;
