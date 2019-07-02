# Nightscout.fi

This repository contains a server that implements several Nighscout Connect functionalities for diabetes related data translation and transfer.

1. Nigthscout.fi, a service that allows users to create an account to expose a Nightscout REST API to the Kanta PHR's Omatietovaranto
2. A simplified version of the Tidepool server, which allows users to upload data from their devices to Omatietovaranto using the Tidepool Uploader
3. Nightscout Consent Service, a SMART on FHIR application that implements a consent flow for asking the permission to view a Nightscout instance

# Setting up

* Clone the repository
* Run 'npm install' to install dependencies
* Copy my.env.template to my.env and modify the file as needed (the file contains sample configuration values needed by the apps)
* Run the server with 'sh start.sh'
* Access the site at 'http://localhost:1300'

# Unit tests & code coverage reporting

The repository uses nyc and Mocha to run unit tests found in the /tests. The tests expect to find a Mongo server running on localhost on port 27017 (default) without authentication ('brew install mongodb'). Run the tests with 'npm test'. Run code coverage report by running 'npm run-script coverage'. Get full HTML output with 'npm run-script coverage-html'.

# Email features

The codebase uses SendGrid to send email for email verification / consent requests. The SendGrid API key for this purpose is configured in SENDGRID_API_KEY env variable. Email template IDs are currently hardcoded -> to be moved to variables if the account used to send email changes.

# Using Tidepool client with the Tidepool server

To run the tidepool client:

* Clone the chrome-uploader project
* Use nvm as suggested to install dependences ('yarn install')
* Create a new configuration script called 'config/local-new.sh' to the config folder based on sample below
* run your script with 'source config/local-new.sh' to use the local server
* run the client with 'yarn dev'
* Create an account by logging into your nightscout.fi instance
* Log in using the username and password you mnade ^^

Sample file for config

```
export API_URL='http://localhost:1300/tpapi'
export UPLOAD_URL='http://localhost:1300/tpupload'
export DATA_URL='http://localhost:1300/tpdata'
export BLIP_URL='http://localhost:1300/tpblip'
export DEBUG_ERROR=false
export REDUX_LOG=false
export REDUX_DEV_UI=false
```


