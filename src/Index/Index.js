import React, { Component } from 'react';

import Login from '../Login/Login';
import Settings from '../Settings/Settings';

class Index extends Component {
  render() {
    const { config } = this.props;
    return (
      <div id="index">
        { (config && config.secret && config.api)
        ? <Settings config={config} />
        : <Login/>
        }
      </div>
    );
  }
}

export default Index;
