import React, { Component, Fragment } from 'react';
import { server } from '../Api/Api';

class SizeBar extends Component {
    render(){
        return(
            <Fragment>
            <div className="sideBar">
                { true === true ? <div className="sideBarElement"><a href={`${server}/fiphr/launch/carelink`}>CareLink</a></div> : null}
                { true === false ? <div className="sideBarElement"><a href="clarity">Clarity</a></div> : null}
            </div>
            </Fragment>
        )
    }
}


export default SizeBar;