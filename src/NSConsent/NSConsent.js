import React, { Component } from 'react';
import EmailRequest from './EmailRequest';
import ConsentGrantForm from './ConsentGrantForm';

import {
  Route,
  Switch,
} from 'react-router-dom';

class NSConsent extends Component {  
    render() {

      var currentLocation = this.props.location.pathname;
      console.log(currentLocation);

    return (
        <Switch>
          <Route path={"/nsconsent/grant"} component={ConsentGrantForm} />
          <Route path={"/nsconsent/request"} component={EmailRequest} />
        </Switch>
     )
  }
}

export default NSConsent;
