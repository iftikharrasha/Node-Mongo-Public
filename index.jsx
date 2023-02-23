require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

const app = express();
app.use(cors()); //middleware
app.use(express.json());

const uri = `mongodb+srv://${process.env.REACT_APP_USERNAME}:${process.env.REACT_APP_PASSWORD}@cluster0.ce7h0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("E24Games");
        const tournaments = database.collection("tournaments");
        const leaderboards = database.collection("leaderboards");
        const tournamentChatroom = database.collection("tournamentChatroom");
        const users = database.collection("users");
        const teams = database.collection("teams");
        const staticLanding = database.collection("staticLanding");
        const giftcards = database.collection("giftcards");
        const versionTable = database.collection("versionTable");

        const handleListApiResponse = async  (req, res, collection, tableTitle) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: [],
                error: null
            }
        
            if(!req.query.version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const clientVersion = parseInt(req.query.version);
                
                try {
                    const cursor = collection.find({});
                    const data = await cursor.toArray();

                    const cursorV = versionTable.find({});
                    const versionData = await cursorV.toArray();
    
                    if (data.length > 0) {
                        try {
                            let serverVersion = 0;
                            // data.forEach( item => {
                            //     if(item.version) {
                            //         serverVersion = Math.max(serverVersion, item.version)
                            //     }
                            // });
                            const tableData = versionData.find( item => item.table === tableTitle);
                            if (tableData && tableData.version) {
                                serverVersion = tableData.version;
                            }

                            if (serverVersion > clientVersion) {
                                response.data = data;
                                response.version = serverVersion;
                            }else {
                                response.status = 304;
                                response.version = serverVersion;
                                response.error = {
                                    code: 304,
                                    message: "Client have the latest version",
                                    target: "fetch data from the redux store"
                                }
                            }
                        } catch (err) {
                            response.data = null;
                            response.success = false;
                            response.status = 500;
                            response.version = serverVersion;
                            response.error = {
                                code: 500,
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from"
                            }
                        }
                    }
                } catch (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        status: 500,
                        data: null,
                        signed_in: false,
                        version: 1,
                        error: { 
                            code: 500, 
                            message: "An Internal Error Has Occurred!",
                            target: "approx what the error came from", 
                        }
                    });
                }
        
                res.send(response);
            }
        }

        const handleSingleApiResponse = async  (req, res, collection) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: [],
                error: null
            }

            if(!req.query.version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const id = req.params.id;
    
                // 1. Check if request is valid
                if (!id) {
                    response.success = false;
                    response.status = 400;
                    response.error = {
                        code: 400,
                        message: "Missing tournament id in the request!",
                        target: "client side api calling issue"
                    }
                    res.send(response);
                }else{
                    const clientVersion = parseInt(req.query.version);
                    const query = { _id: ObjectId(id) };
                    
                    try {
                        const cursor = collection.find(query);
                        const data = await cursor.toArray();
        
                        if (!data) {
                            response.success = false;
                            response.status = 404;
                            response.error = {
                                code: 404,
                                message: "Tournament details not found!",
                                target: "database"
                            }
                        }else{
                            try {
                                if (data[0].version > clientVersion) {
                                    response.data = data[0];
                                    response.version = data[0].version;
                                }else {
                                    response.status = 304;
                                    response.version = clientVersion;
                                    response.error = {
                                        code: 304,
                                        message: "Client have the latest version",
                                        target: "fetch data from the redux store"
                                    }
                                }
                            } catch (err) {
                                response.data = null;
                                response.success = false;
                                response.status = 500;
                                response.version = clientVersion;
                                response.error = {
                                    code: 500,
                                    message: "An Internal Error Has Occurred!",
                                    target: "approx what the error came from"
                                }
                            }
                        }
                    } catch (err) {
                        console.log(err);
                        res.send({
                            success: false,
                            status: 500,
                            data: null,
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from", 
                            }
                        });
                    }
            
                    res.send(response);
                }
            }
        }

        const handleStaticApiResponse = async  (req, res, collection, tableTitle) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: {},
                error: null
            }

            const { version, country } = req.query;

            if(!version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue send"
                }
                res.send(response);
            }else if(!country){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing country query parameter!",
                    target: "client side api calling issue send"
                }
                res.send(response);
            }else{
                const clientVersion = parseInt(version);
                let serverVersion = 0;

                const cursorV = versionTable.find({});
                const versionData = await cursorV.toArray();
                
                const tableData = versionData.find( item => item.table === tableTitle);
                if (tableData && tableData.version) {
                    serverVersion = tableData.version;
                }
                
                try {
                    collection.findOne({}, (err, result) => {
                        if (err) {
                            response.success = false;
                            response.status = 404;
                            response.error = {
                                code: 404,
                                message: `Server Error!`,
                                target: "database"
                            }
                        } else {
                            if (!result[country]) {
                                response.success = false;
                                response.status = 404;
                                response.error = {
                                    code: 404,
                                    message: `Landing details not found for lang=${country}!`,
                                    target: "database"
                                }
                                res.send(response);
                            }else{
                                try {
                                    if (serverVersion > clientVersion) {
                                        response.data = result[country];
                                        response.version = serverVersion;
                                    }else {
                                        response.status = 304;
                                        response.version = serverVersion;
                                        response.error = {
                                            code: 304,
                                            message: "Client have the latest version",
                                            target: "fetch data from the redux store"
                                        }
                                    }
        
                                    res.send(response);
                                } catch (err) {
                                    response.data = null;
                                    response.success = false;
                                    response.status = 500;
                                    response.version = clientVersion;
                                    response.error = {
                                        code: 500,
                                        message: "An Internal Error Has Occurred!",
                                        target: "approx what the error came from"
                                    }
                                }
                            }
                        }
                    });
                } catch (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        status: 500,
                        data: null,
                        signed_in: false,
                        version: 1,
                        error: { 
                            code: 500, 
                            message: "An Internal Error Has Occurred!",
                            target: "approx what the error came from", 
                        }
                    });
                }
            }
        }

        //Get Api for all tournaments
        app.get('/api/tournament/all', async (req, res) => {
            if (req.headers.authorization) {
                if (req.headers.authorization.startsWith('Bearer ')) {
                    const token = req.headers.authorization.split(' ')[1];
                    console.log(token)
                } else {
                    console.log('Should start with Bearer')
                }
            }
            handleListApiResponse(req, res, tournaments, 'tournaments');
        });
        
        //Get Api for leaderboards N.B: which tournaments?
        app.get('/api/tournament/leaderboards', async (req, res) => {
            handleListApiResponse(req, res, leaderboards, 'leaderboards');
        })

        //Get Api for chatroom under tournament
        app.get('/api/tournament/chatroom/all', async (req, res) => {
            handleListApiResponse(req, res, tournamentChatroom, 'tournamentChatroom');
        })

        //Get Api for all teams
        app.get('/api/team/all', async (req, res) => {
            handleListApiResponse(req, res, teams, 'teams');
        })

        //Get Api for static landing data with language
        app.get('/api/settings/landing', async (req, res) => {
            handleStaticApiResponse(req, res, staticLanding, 'staticLanding');
        });

        //Get Api for static landing data with language
        app.get('/api/wallet/topup', async (req, res) => {
            handleListApiResponse(req, res, giftcards, 'giftcards');
        });
        
        //Get Api for details of a tournament
        app.get('/api/tournament/details/:id', async (req, res) => {
            handleSingleApiResponse(req, res, tournaments);
        });

        //Get Api for chatroom under tournament
        app.get('/api/tournament/chatroom/:id', async (req, res) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: [],
                error: null
            }

            if(!req.query.version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const id = req.params.id;
    
                // 1. Check if request is valid
                if (!id) {
                    response.success = false;
                    response.status = 400;
                    response.error = {
                        code: 400,
                        message: "Missing tournament id in the request!",
                        target: "client side api calling issue"
                    }
                    res.send(response);
                }else{
                    const clientVersion = parseInt(req.query.version);
                    const query = { tId: id };
                    
                    try {
                        const cursor = tournamentChatroom.find(query);
                        const data = await cursor.toArray();
        
                        if (!data) {
                            response.success = false;
                            response.status = 404;
                            response.error = {
                                code: 404,
                                message: "Chat details not found!",
                                target: "database"
                            }
                        }else{
                            try {
                                if (data[0].version > clientVersion) {
                                    response.data = data[0];
                                    response.version = data[0].version;
                                }else {
                                    response.status = 304;
                                    response.version = clientVersion;
                                    response.error = {
                                        code: 304,
                                        message: "Client have the latest version",
                                        target: "fetch data from the redux store"
                                    }
                                }
                            } catch (err) {
                                response.data = null;
                                response.success = false;
                                response.status = 500;
                                response.version = clientVersion;
                                response.error = {
                                    code: 500,
                                    message: "An Internal Error Has Occurred!",
                                    target: "approx what the error came from"
                                }
                            }
                        }
                    } catch (err) {
                        console.log(err);
                        res.send({
                            success: false,
                            status: 500,
                            data: null,
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from", 
                            }
                        });
                    }
            
                    res.send(response);
                }
            }
        })

        //Get Api for details of a tournament
        app.get('/api/tournament/leaderboards/:id', async (req, res) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: [],
                error: null
            }

            if(!req.query.version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const id = req.params.id;
    
                // 1. Check if request is valid
                if (!id) {
                    response.success = false;
                    response.status = 400;
                    response.error = {
                        code: 400,
                        message: "Missing tournament id in the request!",
                        target: "client side api calling issue"
                    }
                    res.send(response);
                }else{
                    const clientVersion = parseInt(req.query.version);
                    const query = { tId: id };
                    
                    try {
                        const cursor = leaderboards.find(query);
                        const data = await cursor.toArray();
        
                        if (!data) {
                            response.success = false;
                            response.status = 404;
                            response.error = {
                                code: 404,
                                message: "Tournament details not found!",
                                target: "database"
                            }
                        }else{
                            try {
                                if (data[0].version > clientVersion) {
                                    response.data = data[0];
                                    response.version = data[0].version;
                                }else {
                                    response.status = 304;
                                    response.version = clientVersion;
                                    response.error = {
                                        code: 304,
                                        message: "Client have the latest version",
                                        target: "fetch data from the redux store"
                                    }
                                }
                            } catch (err) {
                                response.data = null;
                                response.success = false;
                                response.status = 500;
                                response.version = clientVersion;
                                response.error = {
                                    code: 500,
                                    message: "An Internal Error Has Occurred!",
                                    target: "approx what the error came from"
                                }
                            }
                        }
                    } catch (err) {
                        console.log(err);
                        res.send({
                            success: false,
                            status: 500,
                            data: null,
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from", 
                            }
                        });
                    }
            
                    res.send(response);
                }
            }
        });
        
        //post Api for login
        app.post('/api/account/login', async (req, res) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: {},
                error: null
            }

            const { emailAddress, password } = req.body;

            if(!emailAddress){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing email in the body parameter!",
                    target: "client side api calling issue send"
                }
                res.send(response);
            }else if(!password){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing password in the body parameter!",
                    target: "client side api calling issue send"
                }
                res.send(response);
            }else{

                try{
                    const query = { emailAddress: emailAddress, password: password };

                    const user = await users.findOne(query);
                    
                    if (!user) {
                        res.send({
                            success: false,
                            status: 401,
                            data: {},
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "Invalid Username and Password!",
                                target: "approx what the error came from", 
                            }
                        });
                    } else {
                        const secret = process.env.REACT_APP_PASSWORD;
                        const options = { expiresIn: '24h' };
                        const payload = {
                            sub: user._id,
                            name: user.userName,
                            email: user.emailAddress,
                            typ: user.permissions,
                            photo: user.photo,
                        };

                         // Create a access token
                        const token = jwt.sign(payload, secret, options);

                         // Create a refresh token
                         const refreshToken = uuid.v4();  //need expiration time


                        response.signed_in = true;
                        response.data = {
                            jwt: token,
                            refreshToken: refreshToken,
                        };
                        res.send(response);
                    }
                } catch (err) {
                        console.log(err);
                        res.send({
                            success: false,
                            status: 500,
                            data: null,
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from", 
                            }
                        });
                }
            }
        });
        
        //Get Api for profile details of a account
        app.get('/api/account/profile/:id', async (req, res) => {
            let response = {
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: [],
                error: null
            }

            if(!req.query.version){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Missing version query parameter!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const id = req.params.id;
    
                // 1. Check if request is valid
                if (!id) {
                    response.success = false;
                    response.status = 400;
                    response.error = {
                        code: 400,
                        message: "Missing tournament id in the request!",
                        target: "client side api calling issue"
                    }
                    res.send(response);
                }else{
                    const clientVersion = parseInt(req.query.version);
                    const query = { _id: ObjectId(id) };
                    
                    try {
                        const cursor = users.find(query);
                        const data = await cursor.toArray();
        
                        if (!data) {
                            response.success = false;
                            response.status = 404;
                            response.error = {
                                code: 404,
                                message: "Tournament details not found!",
                                target: "database"
                            }
                        }else{
                            try {
                                if (data[0].version > clientVersion) {
                                    const cleanedProfile = _.omit(data[0], ['password']);
                                    response.data = cleanedProfile;
                                    response.version = data[0].version;
                                }else {
                                    response.status = 304;
                                    response.version = clientVersion;
                                    response.error = {
                                        code: 304,
                                        message: "Client have the latest version",
                                        target: "fetch data from the redux store"
                                    }
                                }
                            } catch (err) {
                                response.data = null;
                                response.success = false;
                                response.status = 500;
                                response.version = clientVersion;
                                response.error = {
                                    code: 500,
                                    message: "An Internal Error Has Occurred!",
                                    target: "approx what the error came from"
                                }
                            }
                        }
                    } catch (err) {
                        console.log(err);
                        res.send({
                            success: false,
                            status: 500,
                            data: null,
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "An Internal Error Has Occurred!",
                                target: "approx what the error came from", 
                            }
                        });
                    }
            
                    res.send(response);
                }
            }
        });


        //Get Api for offers
        // app.post('/api/Quiz/StartQuiz', async (req, res) => {
        //     //     const token = req.body; //console.log(req.body);
        //     const cursor = quesCollection.find({});
        //     const offers = await cursor.toArray();
        //     res.send(offers);
        // })

        //Post Api for orders
        // app.post('/add-order', async(req, res) => {
        //     const order = req.body; //console.log(req.body);
        //     const result = await ordersCollection.insertOne(order);

        //     console.log('An order was inserted:', result);
        //     res.json(result); //output on client site as a json
        // })

        //Put Api for admin
        // app.put('/accounts/admin', async(req, res) => {
        //     const account = req.body; 
        //     const filter = { email: account.email };
        //     const updateDoc = { $set: {role: 'admin'} };

        //     const result = await accountCollections.updateOne(filter, updateDoc);
        //     res.json(result);
        // })

    } finally {
    //   await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server is loading!');
})

app.listen(port, () => console.log('Server is loading at port@5000'));