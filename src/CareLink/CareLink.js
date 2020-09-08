import React, { Component } from 'react';

import '../CareLink/carelink.scss';

class CareLink extends Component {

   
  

    handleSubmit(event){
       
        event.preventDefault();
        const data = new FormData(event.target);
        console.log(data.get('careLinkUserNAme'));
        console.log(data.get('careLinkPassword'));
    }


    render(){

        return (
        <>
            <section id="nightscout">
            <div className="container">
                <div>
                <h2>Kirjaudu Carelink palveluun:</h2>
                </div>
                <form onSubmit={this.handleSubmit}>
                   <div>
                        <div className="spacing">
                            <div>Tunnus</div>
                            <div><input type="text" className="userNameInput" name="careLinkUserNAme"></input></div>
                        </div>
                        <div  className="spacing">
                            <div>Salasana</div>
                             <div ><input type="password" className="passwordInput" name="careLinkPassword"></input></div>
                        </div>
                        <div className="spacing"  >
                            <input type="submit" value="Tallenna" ></input>
                        </div>
                    </div>
                </form>
                <h3>Kirjautumalla CareLink palveluun annat SensoTrend palvelulle oikeudet tuoda tiedot omatietovarastoon.  </h3>
            </div>    
            </section>
            
        </>
        )

    }
}

export default CareLink;