import React, { Component } from 'react';

import ParallaxBase from './ParallaxBase';
import ParallaxGroup from './ParallaxGroup';
import ParallaxLayer, { back, base } from './ParallaxLayer';

import Header from '../Header/Header';
import './parallax.scss';

class ParallaxComponent extends Component {
  render() {
    const { background, children, header } = this.props;
    return (
      <ParallaxBase>
        <ParallaxGroup>
          <ParallaxLayer layer={back}>
            {background}
          </ParallaxLayer>
          <ParallaxLayer layer={base}>
            {header}
            {children}
          </ParallaxLayer>
        </ParallaxGroup>
      </ParallaxBase>
    );
  }
}

ParallaxComponent.defaultProps = {
  background: <div className="image-background" />,
  header: <Header />,
};

export default ParallaxComponent;
