import React, { Component, Fragment } from 'react';


class SizeBar extends Component {
    render(){
        return(
            <Fragment>
            <div className="sideBar">
                { true === true ? <div className="sideBarElement"><a href="carelink">CareLink</a></div> : null}
                { true === false ? <div className="sideBarElement"><a href="clarity">Clarity</a></div> : null}
            </div>
            </Fragment>
        )
    }
}


export default SizeBar;