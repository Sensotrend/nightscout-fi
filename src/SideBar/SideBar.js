import React, { Component, Fragment } from 'react';


class SizeBar extends Component {
    render(){
        return(
            <div className="sideBar">
                { true == true ? <div className="sideBarElement">CareLink</div> : null}
                { true == false ? <div className="sideBarElement">Clarity</div> : null}
            </div>
        )
    }
}


export default SizeBar;