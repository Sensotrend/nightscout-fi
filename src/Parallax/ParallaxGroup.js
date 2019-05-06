import React, { Component } from 'react';

import './parallax.scss';

class ParallaxGroup extends Component {

  render() {
    const { children } = this.props;
    return (
      <div className="parallax__group">
        { children }
      </div>
    );
  }
}

export default ParallaxGroup;
