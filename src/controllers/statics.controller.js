const { getLandingStaticsService, createStaticService } = require("../services/statics.service");
const { getVersionTableService } = require("../services/versionTable.service");
var geoip = require('geoip-lite');

const getLandingStatics = async (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    var geo = geoip.lookup(clientIP);
    
    try{
        // Check if the response is already cached
        if (res.headersSent) {
          return; // Skip processing if response is already sent
        }

        let response = {
            success: true,
            status: 200,
            signed_in: false,
            version: 1,
            data: {},
            error: null
        }

        const { version, country } = req.query;

        if(!country){
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

            const versionData = await getVersionTableService();
            
            const tableData = versionData.find( item => item.table === "statics");
            if (tableData && tableData.version) {
                serverVersion = tableData.version;
            }
            
            try {
                const data = await getLandingStaticsService();
                if (!data[country]) {
                    response.success = false;
                    response.status = 404;
                    response.error = {
                        code: 404,
                        message: `Static details not found for lang=${country}!`,
                        target: "database"
                    }
                }else{
                    try {
                        if (serverVersion > clientVersion) {
                            response.data = data[country];
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
                        response.version = clientVersion;
                        response.error = {
                            code: 500,
                            message: "An Internal Error Has Occurred!",
                            target: "approx what the error came from"
                        }
                    }
                }
                res.send(response);
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
                        target: "approx what the error came from 2", 
                    }
                });
            }
        }
    }catch(err){
       next(err);
    }
}

const createStatic = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
        message: "Success",
    }
    try {
    // save or create
        const result = await createStaticService(req.body);

        response.data = result;
        response.message = "Static created successfully";

        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 400;
        response.message = "Data is not inserted";
        response.error = {
            code: 400,
            message: error.message,
            target: "client side api calling issue"
        }

        res.send(response);
    }
};

module.exports = {
    getLandingStatics,
    createStatic,
}