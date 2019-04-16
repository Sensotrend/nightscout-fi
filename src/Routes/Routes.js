import React, { Component } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import Account from '../Account/Account';
import Deleted from '../Account/Deleted';
import { server } from '../Api/Api';
import EmailRequest from '../EmailVerification/EmailRequest';
import Eula from '../Eula/Eula';
import Instructions from '../Instructions/Instructions';
import Index from '../Index/Index';
import Logout from '../Logout/Logout';
import Privacy from '../Privacy/Privacy';
import Support from '../Support/Support';

const base = process.env.PUBLIC_URL;
const supportsHistory = 'pushState' in window.history;

const { origin } = window;
export const localhostAPI = origin && (origin.match(/^https?:\/\/localhost/))
? `${origin.substring(0, origin.indexOf(':', 7)).replace(/^https/i, 'http')}:8080/api`
: false;

export const fetchConfig = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: localhostAPI ? 'include' : 'same-origin',
  mode: localhostAPI ? 'cors' : 'same-origin',
  cache: 'default',
};

const ProtectedRoute = ({
  component: Comp,
  componentProps,
  config,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render = {cProps => config
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
  constructor(props) {
    super(props);
    this.state = {
      initializing: true,
    };
  }

  componentDidMount() {
    fetch(`${server}/fiphr/config`, fetchConfig)
    .then(res => {
      switch (res.status) {
        case 200: return res.json();
        case 204: return {};
        default:
          const error = new Error('Unable to load user config');
          error.response = res;
          throw error;
      }
    })
    .then(json => {
      this.setState({
        initializing: false,
        config: json,
      });
    })
    .catch(error => {
      console.error(error);
      this.setState({
        initializing: false,
        error,
      });
    });
  }

  componentDidUpdate

  render() {
    const { config, initializing } = this.state;
    if (initializing) {
      return <div />;
    }
    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <React.Fragment>
          <Switch>
            <ProtectedRoute path="/account" config={config} component={Account} componentProps={{ config: config }} />
            <Route path="/deleted" component={Deleted} />
            <Route path="/eula" component={Eula} />
            <Route
              path="/index"
              render={props => <Index {...props} config={config} />}
            />
            <Route
              path="/instructions"
              render={props => <Instructions {...props} config={config} />}
            />
            <Route path="/logout" component={Logout} />
            <Route path="/privacy" component={Privacy} />
            <ProtectedRoute path="/registration" config={config} component={EmailRequest} />
            <Route path="/support" component={Support} />
            <Redirect from="/" to="/index" />
          </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default Routes;
