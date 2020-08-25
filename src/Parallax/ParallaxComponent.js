import React, { Component, Fragment } from 'react';

import Header from '../Header/Header';
import './parallax.scss';

export const getBaseLayerSize = () => {
  const baseLayer = document.getElementsByClassName('parallax__layer--base');
  if (baseLayer) {
    return baseLayer[0].scrollHeight;
  }
  return undefined;
}

const defaultState = {
  backLayerHeight: '100vh',
};

class ParallaxComponent extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  }

  render() {
    const { children, header } = this.props;
    return (
      <Fragment>
        {header}
        {children}
      </Fragment>
    );
  }
}

ParallaxComponent.defaultProps = {
  background: <div className="image-background" />,
  header: <Header />,
};

export default ParallaxComponent;
