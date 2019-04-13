import React, { Component } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import Eula from '../Eula/Eula';
import Instructions from '../Instructions/Instructions';
import Index from '../Index/Index';
import Privacy from '../Privacy/Privacy';
import Settings from '../Settings/Settings';
import Support from '../Support/Support';

const base = process.env.PUBLIC_URL;
const supportsHistory = 'pushState' in window.history;

const ProtectedRoute = ({
  component: Comp,
  componentProps,
  user,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render = {cProps => user
        ? <Comp {...cProps} {...componentProps} />
        : <Redirect
          to={{
            pathname: '/index',
            state: { from: cProps.location },
          }}
        />
      }
    />
  );
};

class Routes extends Component {
  render() {
    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <React.Fragment>
          <Switch>
            <Route path="/index" component={Index} />
            <ProtectedRoute path="/settings" component={Settings} />
            <Route path="/eula" component={Eula} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/instructions" component={Instructions} />
            <Route path="/support" component={Support} />
            <Redirect from="/" to="/settings" />
          </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default Routes;
