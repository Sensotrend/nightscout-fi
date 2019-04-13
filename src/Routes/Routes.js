import React, { Component } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import Main from '../Login/Login';

const base = process.env.PUBLIC_URL;
const supportsHistory = 'pushState' in window.history;

class Routes extends Component {
  /*
            <Route path="/index" component={Index} />
            <Route path="/login" render={props => (<Index {...props} user={user} />)} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/eula" component={Eula} />
            <Redirect from="/" to="/index" />
  */
  render() {
    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <React.Fragment>
          <Switch>
            <Route path="/index" component={Main} />
            <Redirect from="/" to="/index" />
          </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default Routes;
