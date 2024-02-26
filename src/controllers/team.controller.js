
const { updateXp } = require("../services/account.service");
const { getAllTeamsService, getMyTeamsByIdService, createTeamService, addTeamToUserService, getTeamPeoplelistService, getTeamDetailsService, teamJoinRequestService, updateTeamByIdService } = require("../services/team.service");
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

const getTeamDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getTeamDetailsService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Team Details Not found",
                target: "database"
            }
        }else{
            if (data.version > clientVersion) {
                response.version = data.version;
                response.data = data;
            }else {
                response.status = 304;
                response.version = clientVersion;
                response.error = {
                    code: 304,
                    message: "Client have the latest version",
                    target: "fetch data from the redux store"
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

const updateTeamById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }

    try {
        const result = await updateTeamByIdService(req.params.id, req.body);

        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Data is not updated";
            response.error = {
                code: 400,
                message: "Team Details Not found",
                target: "database"
            }

            return res.send(response);
        }

        response.data = result;
        response.version = result.version;
        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 500;
        response.error = { 
            code: 500, 
            message: "An Internal Error Has Occurred!",
            target: "approx what the error came from", 
        }
        res.send(response);
    }
};

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
        message: null,
    }
    try {
        // save or create
        const team = await createTeamService(req.body);
        if(team){
            const teamOwner = await addTeamToUserService(req.body.captainId, team._id.toString());
            if(teamOwner){
                response.data = team;
                response.message = "Team created successfully";
        
                res.send(response);
            }else{
                response.success = false;
                response.status = 400;
                response.message = "Problem adding team to user object";
                response.error = {
                    code: 400,
                    message: "Problem adding team to user object",
                    target: "client side api calling issue"
                }
        
                res.send(response);
            }
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem creating the team";
            response.error = {
                code: 400,
                message: "Problem creating the team",
                target: "client side api calling issue"
            }
    
            res.send(response);
        }
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

const getTeamPeoplelist = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }

    const { id } = req.params;

    try {
        const data = await getTeamPeoplelistService(id);

        if (data) {
            response.data = data;
            // response.version = data.version;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No team members found!",
                target: "database"
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

const teamJoinRequest = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null,
        xp: null,
    }

    try {
        const result = await teamJoinRequestService(req.body);

        if (!result.success) {
            response.success = false;
            response.status = 400;
            response.message = "Coudln't join the team";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }

        if(result.xp){
            const xpToBeAdded = 50;
            const xpAdd = await updateXp(req.params.id, xpToBeAdded, 0, 0); //adding xp to the users account
            if(xpAdd.success){
                response.xp = [
                    result.message,
                    `Unlocking XP points..`,
                    `You've earned +${xpToBeAdded} XP points`
                ]
            }
        }

        response.data = req.body;
        response.version = result.version;
        response.message = result.message;

        res.send(response);
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            status: 500,
            data: null,
            signed_in: false,
            version: 1,
            error: { 
                code: 500, 
                message: "An Internal Error Has Occurred",
                target: "approx what the error came from", 
            }
        });
    }
};

module.exports = {
    getAllTeams,
    getTeamDetails,
    updateTeamById,
    getMyTeamsById,
    addANewTeam,
    getTeamPeoplelist,
    teamJoinRequest
}