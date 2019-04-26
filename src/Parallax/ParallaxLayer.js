import React, { Component } from 'react';

import './parallax.scss';

export const deep = '--deep';
export const back = '--back';
export const base = '--base';
export const fore = '--fore';

class ParallaxLayer extends Component {

  render() {
    const { children, layer, className } = this.props;
    return (
      <div className={`parallax__layer parallax__layer${layer}${ className ? ` ${className}` : ''}`}>
        { children }
      </div>
    );
  }
}

export default ParallaxLayer;
