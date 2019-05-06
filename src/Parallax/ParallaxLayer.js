import React, { Component } from 'react';

import './parallax.scss';

export const deep = '--deep';
export const back = '--back';
export const base = '--base';
export const fore = '--fore';

class ParallaxLayer extends Component {

  render() {
    const { children, layer, className, height } = this.props;
    let style;
    if (height) {
      style = {
        height
      };
    }
    return (
      <div
        className={`parallax__layer parallax__layer${layer}${ className ? ` ${className}` : ''}`}
        style={style}
      >
        { children }
      </div>
    );
  }
}

export default ParallaxLayer;
