const { ObjectId } = require("mongodb");
const { getDb } = require("../utils/dbConnect");
const { getAllTournamentsService, getTournamentDetailsService, createTournamentService, updateTournamentByIdService, deleteTournamentByIdService, getLeaderboardsService, tournamentRegistrationService } = require("../services/tournament.sevice.js");
const { getVersionTableService } = require("../services/versionTable.service.js");

const getAllTournaments = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getAllTournamentsService();
        const versionData = await getVersionTableService();

        if (data.length > 0) {
            try {
                let serverVersion = 0;
                const tableData = versionData.find( item => item.table === "tournaments");
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

const getTournamentDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getTournamentDetailsService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Tournament Details Not found",
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

const addANewTournament = async (req, res, next) => {
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
        const result = await createTournamentService(req.body);

        response.data = result;
        response.message = "Tournament created successfully";

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

const updateTournamentDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }

    try {
        const { id } = req.params;
    
        const result = await updateTournamentByIdService(id, req.body);
    
        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Data is not updated";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }
        response.version = result.version;
        response.data = result;
        response.message = "Tournament updated successfully";
        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 400;
        response.message = "Data is not updated";
        response.error = {
            code: 400,
            message: error.message,
            target: "client side api calling issue"
        }

        res.send(response);
    }
};

const deleteTournamentDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try {
        const { id } = req.params;
    
        const result = await deleteTournamentByIdService(id);
    
        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Data is not deleted";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }
  
        response.version = result.version;
        response.data = result;
        response.message = "Tournament deleted successfully";
        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 400;
        response.message = "Data is not deleted";
        response.error = {
            code: 400,
            message: error.message,
            target: "client side api calling issue"
        }

        res.send(response);
    }
};

const getLeaderboards = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getLeaderboardsService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Leaderboards Not found",
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

const tournamentRegistration = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
        message: "Success",
    }
    try {
        const tId = req.params.id;
        const uId = req.user.sub;

        // save or create
        const result = await tournamentRegistrationService(tId, uId);

        response.data = result;
        response.message = "User registered successfully";

        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 400;
        response.message = "User is not registered";
        response.error = {
            code: 400,
            message: error.message,
            target: "client side api calling issue"
        }

        res.send(response);
    }
};

module.exports = {
    getAllTournaments,
    getTournamentDetails,
    updateTournamentDetails,
    deleteTournamentDetails,
    addANewTournament,
    getLeaderboards,
    tournamentRegistration
}