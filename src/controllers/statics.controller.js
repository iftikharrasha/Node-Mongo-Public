const { ObjectId } = require("mongodb");
const { getLandingStaticsService } = require("../services/statics.service");
const { getVersionTableService } = require("../services/versionTable.service");

const getLandingStatics = async (req, res, next) => {
    try{
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
    }catch(err){
       next(err);
    }
}

module.exports = {
    getLandingStatics,
}