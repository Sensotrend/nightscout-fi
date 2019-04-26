import React, { Component } from 'react';

import './parallax.scss';

class ParallaxBase extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className="parallax">
        <div className="parallax__container">
          { children }
        </div>
      </div>
    );
  }
}

export default ParallaxBase;
