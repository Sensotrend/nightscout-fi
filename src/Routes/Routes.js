import React, { Component } from 'react';
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from 'react-router-dom';

import { server } from '../Api/Api';
import Eula from '../Eula/Eula';
import Instructions from '../Instructions/Instructions';
import Index from '../Index/Index';
import Logout from '../Logout/Logout';
import Privacy from '../Privacy/Privacy';
import Support from '../Support/Support';

const base = process.env.PUBLIC_URL;
const supportsHistory = 'pushState' in window.history;

class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initializing: true,
      config: {
        secret: 'test-site-secret',
        api: 'localhost:1300/api/v1',
      },
    };
  }

  componentDidMount() {
    fetch(`${server}/fiphr/config`, {
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
    })
    .then(res => res.json())
    .then(json => {
      this.setState({
        initializing: false,
        config: json,
      });
    })
    .catch(err => {
      console.error('Unable to load config', err);
      this.setState({
        initializing: false,
      });
    });
  }

  render() {
    const { config, initializing } = this.state;
    if (initializing) {
      return <div />;
    }
    return (
      <Router basename={base} forceRefresh={!supportsHistory}>
        <React.Fragment>
          <Switch>
            <Route
              path="/index"
              render={props => <Index {...props} config={config} />}
            />
            <Route path="/eula" component={Eula} />
            <Route path="/privacy" component={Privacy} />
            <Route
              path="/instructions"
              render={props => <Instructions {...props} config={config} />}
            />
            <Route path="/support" component={Support} />
            <Route path="/logout" component={Logout} />
            <Redirect from="/" to="/index" />
          </Switch>
        </React.Fragment>
      </Router>
    );
  }
}

export default Routes;
