import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
      <div className="header" id="header">
        <div className="container">
          <h1 id='maintitle'><img src="nightscout.png" />Nightscout Connect</h1>
        </div>
      </div>
    );
  }
}

export default Header;