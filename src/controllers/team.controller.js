
const { getAllTeamsService, getMyTeamsByIdService, createTeamService } = require("../services/team.service");
const { getVersionTableService } = require("../services/versionTable.service");

const getAllTeams = async (req, res, next) => {
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
            
            try {
                const data = await getAllTeamsService();
                const versionData = await getVersionTableService();

                if (data.length > 0) {
                    try {
                        let serverVersion = 0;
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
    }catch(err){
       next(err);
    }
}

const getMyTeamsById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getMyTeamsByIdService(req.params.id);
        const versionData = await getVersionTableService();

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No teams found!",
                target: "database"
            }
        }else{
            try {
                let serverVersion = 0;
                const tableData = versionData.find( item => item.table === "teams");
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
    } catch (error) {
        response.success = false;
        response.status = 500;
        response.error = { 
            code: 500, 
            message: "An Internal Error Has Occurred!",
            target: "approx what the error came from", 
        }
    }
    res.send(response);
};

const addANewTeam = async (req, res, next) => {
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
        const result = await createTeamService(req.body);

        response.data = result;
        response.message = "Team created successfully";

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
    getAllTeams,
    getMyTeamsById,
    addANewTeam,
}