import React, { Component } from 'react';

import './actions.scss';

class ActionsMenu extends Component {

  render() {
    const { children } = this.props;
    return (
      <div id="actions">
        { children }
      </div>
    );
  }
}

export default ActionsMenu;
