import React, { Component } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

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

const localhostAPI = window.origin && (window.origin.match(/^https?:\/\/localhost/))
? `${origin.substring(0, origin.indexOf(':', 7)).replace(/^https/i, 'http')}:8080/api`
: false;

const getSearchParam = (location, key) => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === key) {
      return decodeURIComponent(pair[1]);
    }
  }
  return undefined;
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
      initializing: false,
      config: {
        secret: 'test-site-secret',
        api: 'localhost:1300/api/v1',
      },
    };
  }

  componentDidMount() {
    fetch(`${server}/fiphr/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: localhostAPI ? 'include' : 'same-origin',
      mode: localhostAPI ? 'cors' : 'same-origin',
      cache: 'default',
    
    })
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
    .catch(err => {
      console.error(err);
      this.setState({
        initializing: false,
      });
    });
  }

  componentDidUpdate

  render() {
    const { config, initializing } = this.state;
    if (initializing) {
      return <div />;
    }
    // const { location } = this.props;
    const { location } = document;
    /*
    const api = getSearchParam(location, 'api');
    const secret = getSearchParam(location, 'site');
    const config = { api, secret };

        <Route
          render={({ location }) => {
            if (api && secret) {
              // clear the parameter
              console.log('Redirecting...', api, secret);
              return <Redirect to={{ ...location, search: '' }} />;
            }
            return null;
          }}
        />
    */

    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <React.Fragment>
          <Switch>
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
            <ProtectedRoute path="/registration" component={EmailRequest} />
            <Route path="/support" component={Support} />
            <Redirect from="/" to="/index" />
          </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default Routes;
