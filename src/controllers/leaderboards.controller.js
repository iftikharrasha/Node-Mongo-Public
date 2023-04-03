const { ObjectId } = require("mongodb");
const { getLeaderboardsService, getLeaderboardDetailsService } = require("../services/leaderboards.service");
const { getVersionTableService } = require("../services/versionTable.service");

//this might need later on from admin panel or scoreboard to show leaderboards
// const getLeaderboards = async (req, res, next) => {
//     try{
//         let response = {
//             success: true,
//             status: 200,
//             signed_in: false,
//             version: 1,
//             data: [],
//             error: null
//         }

//         if(!req.query.version){
//             response.success = false;
//             response.status = 400;
//             response.error = {
//                 code: 400,
//                 message: "Missing version query parameter!",
//                 target: "client side api calling issue"
//             }
//             res.send(response);
//         }else{
//             const clientVersion = parseInt(req.query.version);

//             const data = await getLeaderboardsService();
//             const versionData = await getVersionTableService();

//             console.log(data);
    
//             if(data.length > 0){
//                 try {
//                     let serverVersion = 0;
//                     const tableData = versionData.find( item => item.table === "leaderboards");
//                     if (tableData && tableData.version) {
//                         serverVersion = tableData.version;

//                         if (serverVersion > clientVersion) {
//                             response.data = data;
//                             response.version = serverVersion;
//                         }else {
//                             response.status = 304;
//                             response.version = serverVersion;
//                             response.error = {
//                                 code: 304,
//                                 message: "Client have the latest version",
//                                 target: "fetch data from the redux store"
//                             }
//                         }
//                     }
                    
//                 } catch (err) {
//                     next(err);
//                 }

//             }else{
//                 response.success = false;
//                 response.status = 404;
//                 response.error = {
//                     code: 404,
//                     message: "No leaderboard Found!",
//                     target: "database"
//                 }
//             }

//             res.send(response); //later we will use mongoodse schema
//         }
//     }catch(err){
//        next(err);
//     }
// }

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
    getLeaderboardDetails,
}