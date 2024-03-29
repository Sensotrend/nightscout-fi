import React, { Component } from 'react';
import {
  Link,
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
import Footer from '../Footer/Footer';
import Instructions from '../Instructions/Instructions';
import Index from '../Index/Index';
import Logout from '../Logout/Logout';
import NSConsent from '../NSConsent/NSConsent';
import Privacy from '../Privacy/Privacy';
import Shutdown from '../Shutdown/Shutdown';

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

// Idle time scripts

const inactivityTimeOut = 10 * 60 * 1000; // 10 minutes
let inactivitySessionExpireTimeOut;
let afterIdleCallback;

function clearSessionExpireTimeout() {
  clearTimeout(inactivitySessionExpireTimeOut);
}

function resetIdleTimer() {
  clearSessionExpireTimeout();
  inactivitySessionExpireTimeOut = window.setTimeout(() => {
    if (afterIdleCallback) {
      afterIdleCallback();
    }
  }, inactivityTimeOut);
}

function initIdleTimeCallback(callback) {
  clearSessionExpireTimeout();
  afterIdleCallback = () => {
    document.removeEventListener('click', resetIdleTimer, { capture: true, passive: true });
    document.removeEventListener('mousemove', resetIdleTimer, { capture: true, passive: true });
    document.removeEventListener('keypress', resetIdleTimer, { capture: true, passive: true });
    window.removeEventListener('load', resetIdleTimer, { capture: true, passive: true });
    callback();
  };
  document.addEventListener('click', resetIdleTimer, { capture: true, passive: true });
  document.addEventListener('mousemove', resetIdleTimer, { capture: true, passive: true });
  document.addEventListener('keypress', resetIdleTimer, { capture: true, passive: true });
  window.addEventListener('load', resetIdleTimer, { capture: true, passive: true });
  resetIdleTimer();
}

const ProtectedRoute = ({
  component: Comp,
  componentProps,
  config,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={cProps => config
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

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initializing: true,
      /*
    config: {
      api: 'debug',
      secret: 'debug',
      email: 'debug email',
      notifications: false,
      development: true,
    }
      */
    };
    this.props = props;
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
        initIdleTimeCallback(() => {
          const { config } = this.state;
          if (config.email || config.status) {
            // user has logged in...
            // eslint-disable-next-line no-console
            console.log('Logout after inactivity'); // TODO: translate
            this.setState({
              initializing: false,
              config: undefined,
              logout: true,
            });
          }
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

  render() {
    const { config, initializing } = this.state;
    if (initializing) {
      return <div />;
    }

    return (
      <Router>
       <Switch>
         <Route path="/nsconsent/" component={NSConsent} />
         <PropsRoute path="/" component = {NSFi}
            state={this.state}
            render={props => <NSFi {...props} config={config} />}/>
       </Switch>
      </Router>
    )
  
  }
}

class NSFi extends Component {
  render() {

    const { config, logout } = this.props.state;

    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <Route
          render={props => {
            if (props.location.pathname !== '/shutdown') {
              return (
                <aside class="warning">
                  <strong>Nightscout Connect -palvelun toiminta loppuu
                  lähitulevaisuudessa!</strong>
                  {' '}
                  <Link to="/shutdown">Lue lisää!</Link>
                </aside>
              );
            }
            return null;
          }}
        />
        <Route
          render={props => {
            if (logout && props.location.pathname !== '/logout') {
              return <Redirect to="/logout" />;
            }
            return null;
          }}
        />
        <Switch>
          <ProtectedRoute
            path="/account"
            config={config}
            component={Account}
            componentProps={{ config }}
          />
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
          <Route
            path="/logout"
            render={(props) => (<Logout callback={() => this.setState({
              config: undefined,
              logout: false,
            })} />)}
          />
          <Route path="/privacy" component={Privacy} />
          <Route path="/shutdown" component={Shutdown} />
          <Redirect from="/shutdown.html" to="/shutdown" />
          <ProtectedRoute
            path="/registration"
            config={config}
            component={EmailRequest}
            componentProps={{ config }}
          />
          <Redirect from="/" to="/index" />
        </Switch>
        <Footer />
      </Router>
    );
  }
}

export default Routes;
