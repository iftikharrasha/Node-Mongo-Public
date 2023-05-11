const { getAllTournamentsService, getTournamentDetailsService, createTournamentService, updateTournamentByIdService, deleteTournamentByIdService, deleteTournamentLeaderboardByIdService, getLeaderboardsService, addUserToLeaderboardService } = require("../services/tournament.sevice.js");
const { addToPurchaseService, addPurchaseToTransactionsService } = require("../services/wallet.service.js");
const { getVersionTableService } = require("../services/versionTable.service.js");
const { addPurchasedItemToUserService } = require("../services/account.service.js");

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
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No tournaments found!",
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
        const result2 = await deleteTournamentLeaderboardByIdService(id);
        // console.log(result2.deletedCount)
    
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
        const data = req.body;

        // save or create
        const purchased = await addToPurchaseService(data);  //but check if user already has this purchased
        if(purchased) {
            const transaction = await addPurchaseToTransactionsService(uId, purchased._id.toString());
            if(transaction){
                const result = await addUserToLeaderboardService(tId, uId);
                if(result){
                    const purchaseItem = await addPurchasedItemToUserService(tId, uId);

                    if(purchaseItem){
                        response.data = result;
                        response.message = "User registered successfully";
                    }else{
                        response.success = false;
                        response.status = 400;
                        response.message = "Problem adding purchase item to user object";
                        response.error = {
                            code: 400,
                            message: "User is already registered",
                            target: "client side api calling issue"
                        }
                    }
                }else{
                    response.success = false;
                    response.status = 400;
                    response.message = "Problem adding user to leaderboard";
                    response.error = {
                        code: 400,
                        message: "Problem adding user to leaderboard",
                        target: "client side api calling issue"
                    }
                }
            } else{
                response.success = false;
                response.status = 400;
                response.message = "No transaction documment found for uId";
                response.error = {
                    code: 400,
                    message: "No transaction documment found for uId",
                    target: "client side api calling issue"
                }
            }
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem purchasing the item";
            response.error = {
                code: 400,
                message: "Problem purchasing the item",
                target: "client side api calling issue"
            }
        }

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