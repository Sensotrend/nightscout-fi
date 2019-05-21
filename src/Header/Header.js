import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
      <header>
        <div className="container">
          <h1 id='maintitle'><img src="/nightscout.png" alt="" />Nightscout Connect</h1>
        </div>
      </header>
    );
  }
}

export default Header;