import React, { Component } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { fetchConfig } from '../Routes/Routes';
import { server } from '../Api/Api';
import '../CareLink/carelink.scss';



class CareLink extends Component {

    _timerData = null;
    
    constructor(props){
        super(props);
        this.state = {
            careLinkUserName: '',
            careLinkPassword: '',
            information: false,
            save: false,
            redirectCounter: 0
        }

       
    }
  
    componentDidMount(){
        this._timerData = null;
        fetch(`${server}/carelink/v1/user`,{
            ...fetchConfig,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then( handledData => {
            this.setState({ careLinkUserName: handledData.userName, careLinkPassword: handledData.userPassword})
        }).catch(error => { console.log(error) });

    }

    componentWillUnmount(){
        clearInterval(this._timerData);
    }

    render(){
        return (
        <>
            <section id="nightscout">
            <div className="header">Sensotrend</div>
            <div className="container">
                <div>
                <h2>Kirjaudu Carelink palveluun:</h2>
                </div>
                <Formik
                    enableReinitialize
                      initialValues={{
                        careLinkUserName: this.state.careLinkUserName || '',
                        careLinkPassword:  this.state.careLinkPassword || '',
                      }}
                      validate={values => {
                          const errors = {};
                          
                          if(values.careLinkUserName.length === 0){
                              errors.careLinkUserName = "Käyttäjänimi vaaditaan!";
                          }
                        
                          if( values.careLinkPassword.length === 0){
                            errors.careLinkPassword = "Salasana vaaditaan!";
                          }

                          return errors;
                      }}
                      onSubmit={async values => {
                    if( ( values.careLinkUserName === this.state.careLinkUserName ) || this.state.information ){
                        this.setState({information: false, save: false}); 
                        await fetch(`${server}/carelink/v1/user/save`, {
                            ...fetchConfig,
                            method: 'POST',
                            body: JSON.stringify(values),
                          }).catch((error) => {
                            console.error(error);
                          }).then(() => {
                            this.setState({save:true});
                            setTimeout(() => {
                                this._timerData = setInterval(() => {
                                    this.setState({redirectCounter: this.state.redirectCounter + 1 });
                                    
                                    if( this.state.redirectCounter >= 10){
                                        this.props.history.push('/logOutSite');
                                    }

                                }, 1000);
                            },9000)
                            console.log('Done');
                          });
                          this.state.careLinkUserName = values.careLinkUserName;
                    }else{
                           this.setState({information: true});   
                    }

                      }}
                >
                <Form>
                   <div>
                            <div className="spacing">
                                <div>Käyttäjänimi</div>
                                <div><Field type="text" placeholder="Syötä käyttäjätunnus" className="userNameInput" id="careLinkUserName" name="careLinkUserName"></Field></div>
                                <div><ErrorMessage  name="careLinkUserName" component="div" className="errorMessageStyle" /></div>
                                {this.state.information && <div>Oletko varma, että haluat tallentaa uuden käyttäjänimen?, jos olet niin paina tallenna.</div>}
                            </div>
                            <div  className="spacing">
                                <div>Salasana</div>
                                <div ><Field type="password" placeholder="Syötä salasana" className="passwordInput" id="careLinkPassword" name="careLinkPassword"></Field></div>
                                <div><ErrorMessage  name="careLinkPassword" component="div" className="errorMessageStyle" /></div>
                            </div>
                            <div className="spacing"  >
                                <button type="submit" disabled={ this.state.redirectCounter > 0 || this.state.save === true ? true : false} className="careLinkSubmitButton" >Tallenna</button>
                                { this.state.save && this.state.redirectCounter === 0 && <div>Tietosi on tallennettu onnistuneesti! <br /> Huom! Tietosi kopioituvat nyt automaattisesti omatietovarantoon</div>}
                            </div>
                        </div>
                    {this.state.redirectCounter > 0 && <div>{this.state.redirectCounter}... 10 sekunnin kuluttua ohjataan uloskirjautumiseen</div>}
                   
                </Form>
                </Formik>
                <h3>Kirjautumalla CareLink palveluun annat SensoTrend palvelulle oikeudet tuoda tiedot omatietovarastoon.  </h3>
            </div>    
            </section>
            
        </>
        )

    }
}

export default CareLink;