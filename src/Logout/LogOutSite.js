import React, { Component } from 'react';

import './logoutsite.scss'

class LogOutSite extends Component {

    constructor(props){
        super(props);
    }

    logOut = () => {
        this.props.history.push('/logout');
    }

    render(){
        return (<>
            <div className="logOutArea">
                <div className="logoutText">Kiitos kirjautumisesta carelink palveluun. <br /> Ole hyvä ja kirjaudu ulos</div>
                <div className="logoutbutton"><button onClick={this.logOut} className="buttonStyle" >Kirjautu ulos</button></div>
            </div>
            </>)
    }
}


export default  LogOutSite;