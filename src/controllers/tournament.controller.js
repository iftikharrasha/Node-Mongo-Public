const { ObjectId } = require("mongodb");
const { getDb } = require("../utils/dbConnect");
const { getAllTournamentsService, getTournamentDetailsService, getLeaderboardDetailsService } = require("../services/tournament.sevice");
const { getVersionTableService } = require("../services/versionTable.service");

const getAllTournaments = async (req, res, next) => {
    try{
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

            const data = await getAllTournamentsService();
            const versionData = await getVersionTableService();

            console.log(data);
    
            if(data.length > 0){
                try {
                    let serverVersion = 0;
                    const tableData = versionData.find( item => item.table === "tournaments");
                    if (tableData && tableData.version) {
                        serverVersion = tableData.version;

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
                    }
                    
                } catch (err) {
                    next(err);
                }

            }else{
                response.success = false;
                response.status = 404;
                response.error = {
                    code: 404,
                    message: "No tournaments Found!",
                    target: "database"
                }
            }

            res.send(response); //later we will use mongoodse schema
        }
    }catch(err){
       next(err);
    }
}

const getTournamentDetails = async (req, res, next) => {
    try{
        //check if there is bearer token
        // if (req.headers.authorization) {
        //     if (req.headers.authorization.startsWith('Bearer ')) {
        //         const token = req.headers.authorization.split(' ')[1];
        //     } else {
        //         console.log('Should start with Bearer')
        //     }
        // }

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
            if(!ObjectId.isValid(id)){
                response.status = 400;
                response.signed_in = false,
                response.error = {
                    code: 400,
                    message: "Not a valid tournament id!",
                    target: "client side api calling issue"
                }
            }else{
                try {
                    const clientVersion = parseInt(req.query.version);
                    const data = await getTournamentDetailsService(id);
                    // console.log(data);
                    if(!data){
                        response.success = false;
                        response.status = 404;
                        response.error = {
                            code: 400,
                            message: "Tournament Details Not found!",
                            target: "database"
                        }
                    }else{
                        try {
                            if (data.version > clientVersion) {
                                response.data = data;
                                response.version = data.version;
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
                } catch (error) {
                    response.success = false;
                    response.status = 500;
                    response.error = { 
                        code: 500, 
                        message: "An Internal Error Has Occurred!",
                        target: "approx what the error came from", 
                    }
                }
            }
            
            res.send(response);
        }
    }catch(err){
       next(err);
    }
}

const updateTournamentDetails = async (req, res, next) => {
    try{
        const db = getDb();
        const id = req.params.id;

        if(!ObjectId.isValid(id)){
            return res.status(400).json({
                success: false,
                status: 400,
                signed_in: false,
                version: 1,
                data: [],
                error: {
                    code: 400,
                    message: "Not a valid tournament!",
                    target: "client side api calling issue"
                }
            })
        }

        //check if there is bearer token
        if (req.headers.authorization) {
            if (req.headers.authorization.startsWith('Bearer ')) {
                const token = req.headers.authorization.split(' ')[1];
            } else {
                console.log('Should start with Bearer')
            }
        }

        const query = { _id: ObjectId(id) };
        const modify = { $set: req.body };
        const data = await db.collection("tournaments").updateOne(query, modify);
        // console.log(data);

        if(!data.matchedCount){
            res.status(400).send({
                success: false,
                status: 404,
                signed_in: false,
                version: 1,
                data: [],
                error: {
                    code: 404,
                    message: "Could not found a tournament based on the id",
                    target: "database"
                }
            });
        }else{
            if(!data.modifiedCount){
                res.status(400).send({
                    success: false,
                    status: 404,
                    signed_in: false,
                    version: 1,
                    data: [],
                    error: {
                        code: 404,
                        message: "Both versions are same, could not update the tool!",
                        target: "database"
                    }
                });
            }else{
                res.status(200).send({
                    success: true,
                    status: 200,
                    signed_in: false,
                    version: 1,
                    data: data,
                    error: null
                });
            }
        }
    }catch(err){
       next(err);
    }
}

const deleteTournamentDetails = async (req, res, next) => {
    try{
        const db = getDb();
        const id = req.params.id;

        if(!ObjectId.isValid(id)){
            return res.status(400).json({
                success: false,
                status: 400,
                signed_in: false,
                version: 1,
                data: [],
                error: {
                    code: 400,
                    message: "Not a valid tournament!",
                    target: "client side api calling issue"
                }
            })
        }

        //check if there is bearer token
        if (req.headers.authorization) {
            if (req.headers.authorization.startsWith('Bearer ')) {
                const token = req.headers.authorization.split(' ')[1];
            } else {
                console.log('Should start with Bearer')
            }
        }

        const query = { _id: ObjectId(id) };
        const data = await db.collection("tournaments").deleteOne(query);
        console.log(data);

        if(!data.deletedCount){
            res.status(400).send({
                success: false,
                status: 404,
                signed_in: false,
                version: 1,
                data: [],
                error: {
                    code: 404,
                    message: "Could not delete the tournament!",
                    target: "database"
                }
            });
        }else{
            res.status(200).send({
                success: true,
                status: 200,
                signed_in: false,
                version: 1,
                data: data,
                error: null
            });
        }
    }catch(err){
       next(err);
    }
}

const addANewTournament = async (req, res, next) => {
    try{
        const db = getDb();

        const newTournament = req.body;
        const data = await db.collection("tournaments").insertOne(newTournament);
        console.log(data);

        if(!data.insertedId){
            res.status(400).send({ status: false, error: "something went wrong" });
        }else{
            res.send({ status: true, message: "data inserted successfully" })
        }
    }catch(err){
       next(err);
    }
}

const getLeaderboardDetails = async (req, res, next) => {
    try{
        //check if there is bearer token
        // if (req.headers.authorization) {
        //     if (req.headers.authorization.startsWith('Bearer ')) {
        //         const token = req.headers.authorization.split(' ')[1];
        //     } else {
        //         console.log('Should start with Bearer')
        //     }
        // }

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
            if(!ObjectId.isValid(id)){
                response.status = 400;
                response.signed_in = false,
                response.error = {
                    code: 400,
                    message: "Not a valid tournament id!",
                    target: "client side api calling issue"
                }
            }else{
                try {
                    const clientVersion = parseInt(req.query.version);
                    const data = await getLeaderboardDetailsService(id);
                    // console.log(data);
                    if(!data){
                        response.success = false;
                        response.status = 404;
                        response.error = {
                            code: 400,
                            message: "Leaderboard Details Not found!",
                            target: "database"
                        }
                    }else{
                        try {
                            if (data.version > clientVersion) {
                                response.data = data;
                                response.version = data.version;
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
                } catch (error) {
                    response.success = false;
                    response.status = 500;
                    response.error = { 
                        code: 500, 
                        message: "An Internal Error Has Occurred 2!",
                        target: "approx what the error came from", 
                    }
                }
            }
            
            res.send(response);
        }
    }catch(err){
       next(err);
    }
}

module.exports = {
    getAllTournaments,
    getTournamentDetails,
    updateTournamentDetails,
    deleteTournamentDetails,
    addANewTournament,
    getLeaderboardDetails
}