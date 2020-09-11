import React, { Component } from 'react';
import { server } from '../Api/Api';
import { fetchConfig } from '../Routes/Routes';

import './logoutsite.scss'

class LogOutSite extends Component {

    constructor(props) {
        super(props);
        this.state = {
          processing: true
        };
      }

    logOut = () => {
        console.log('Logging out', server);
        fetch(`${server}/logout`, fetchConfig)
          .then(res => {
            const { status } = res;
            if (status !== 200) {
              const error = new Error(`Error logging out, status: ${status} ${res.statusText}`);
              error.response = res;
              throw error;
            }
            this.props.callback();
          })
          .catch(error => {
            console.error('Unable to log out!', error);
            this.setState({
              processing: false,
              error,
            });
          });
        
    }

    render(){
        return (<>
            <div className="logOutArea">
                <div className="logoutCollections">
                    <div className="header">
                        Sensotrend
                    </div>
                     <div className="logoutText">Kiitos kirjautumisesta carelink palveluun. <br /> Ole hyvä ja kirjaudu ulos</div>
                     <div className="logoutbutton"><button onClick={this.logOut} className="buttonStyle" >Kirjautu ulos</button></div>
                     { !this.state.processing && <div>Ulos kirjautuminen epäonnistui. Yritä uudelleen.</div> }
                </div>
            </div>
            </>)
    }
}


export default  LogOutSite;