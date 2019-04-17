import React, { Component } from 'react';

import Login from '../Login/Login';
import Settings from '../Settings/Settings';

class Index extends Component {
  render() {
    const { config } = this.props;
    return (
      <section className="dark">
        <div id="index" className="container">
          { (config && config.secret && config.api)
          ? <Settings config={config} />
          : <Login/>
          }
        </div>
      </section>
    );
  }
}

export default Index;
