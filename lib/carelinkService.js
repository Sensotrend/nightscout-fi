import express from 'express';
import { decorateApp } from '@awaitjs/express';
import session from 'express-session';
import MongoStoreProvider from 'connect-mongo';
import bodyParser from 'body-parser';
import {encrypt,decrypt} from './crypto';
import CarelinkInformation from './models/carelink.model';
import carelinkProcessRun from './carelinkProcess';

const MongoStore = MongoStoreProvider(session);


function CarelinkService(env){

    const logger = env.logger;

    const app = decorateApp(express());

    app.use(bodyParser.urlencoded({
        extended: false
     }));

     app.use(bodyParser.json());

       // Use session to pass the iss information to the callback
    app.use(session({
        secret: env.session_key,
        cookie: { maxAge: 30 * 60 * 1000 },
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
        mongooseConnection: env.mongo.getConnection(),
        ttl: 30 * 60
        })
    }));

     app.post('/v1/user/save', async (req, res) => {
        

        if (!req.session || !req.session.user) {
            return res.status(400).json({ error: 'Not authenticated' });
        }
    
       const {careLinkUserName: userName, careLinkPassword: password} = req.body;
       const userId = req.session.user.user_id;
       
       
       const encrypted = encrypt(Buffer.from(password));

       const userInCarelink = await CarelinkInformation.findOne({
        user_name: userName
       });
       
       if( userInCarelink !== null){
            if( userInCarelink.user_id === userId.toString()){
                const filter = {
                    user_id: userId,
                    user_name: userName
                }
                const update = {
                    update_date:  Date.now(),
                    user_password: encrypted
                }

                try{
                //Update password where user_id and user_name is same.
                    await CarelinkInformation.findOneAndUpdate(filter, update, { new: true });
                }catch(error){
                    logger.info(`Error detected when find or update user info: ${JSON.stringify(error, null, 2)}`);
                }
                logger.info('Update password to userid and username!');

            }else {
                //Send error if userid is not match.
                logger.error('Error user is not have access this carelink user');
                return res.status(309).json({ 'not_access': 'user is not have access this carelink user' });
            }
            
       }else{

            const findIfUserIdHaveCareLink = await CarelinkInformation.find({
                user_id: userId
            });

            if(findIfUserIdHaveCareLink.length === 0){

            const newUserInCarelink = new CarelinkInformation({
                user_id: userId,
                user_name: userName,
                user_password: encrypted,
                create_date: Date.now(),
            });

            try {
                await newUserInCarelink.save();
                logger.info('Create new username in carelink!');
             } catch (error) {
                logger.error('Error creating new user to carelink: ' + JSON.stringify(error, null, 2));
             }
            }else{
                const filter = {
                    user_id: userId,
                }

                const update = {
                    user_name: userName,
                    update_date:  Date.now(),
                 
                }
                try{
                //Update password where user_id and user_name is same.
                await CarelinkInformation.findOneAndUpdate(filter, update,{ new: true});
                }catch(error){
                    logger.info(`Error detected when find or update user info: ${JSON.stringify(error, null, 2)}`);
                }
                
                logger.info('Update username to userid!');
            }    
       }

       //StartUp careLinkConenct
       try{
             carelinkProcessRun();
       }catch(e){
            res.status(409).json({error: 'Carelink data cannot to process'})
       }



       res.send('Ok');
        
     });

     app.post('/v1/user', async (req, res) => {

        if (!req.session || !req.session.user) {
            return res.status(400).json({ error: 'Not authenticated' });
        }
        const userId = req.session.user.user_id;
       
        const getUserData = await CarelinkInformation.findOne({
            user_id: userId
        })
        res.setHeader('Content-Type', 'application/json');
        
        res.send(JSON.stringify({
         'userName':  getUserData.user_name,
         'userPassword': decrypt(getUserData.user_password).toString()
        }));

     });


     return app;

}


export default CarelinkService;