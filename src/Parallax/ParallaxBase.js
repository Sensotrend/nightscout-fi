import React, { Component } from 'react';

import './parallax.scss';

class ParallaxBase extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className="parallax">
        {children}
      </div>
    );
  }
}

export default ParallaxBase;
