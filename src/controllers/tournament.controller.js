const { getAllTournamentsService, getAllTournamentsFilteredService, getTournamentDetailsService, createTournamentService, updateTournamentByIdService, updateTournamentApprovalService, deleteTournamentByIdService, deleteTournamentBracketByIdService, deleteTournamentLeaderboardByIdService, getLeaderboardsService, getBracketService, getCredentialsService, addUserToLeaderboardService, addUserToTournamentObjectLeaderboard, bookUserToBracketSlotService, getAllMasterTournamentsService, getAllInternalTournamentsService, addTournamentThumbnailService } = require("../services/tournament.sevice.js");
const { addToPurchaseService, addPurchaseToTransactionsService } = require("../services/wallet.service.js");
const { addPurchasedItemToUserService, updateXp } = require("../services/account.service.js");
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

const getAllTournamentsFiltered = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try {
        const {version, status, masterProfile} = req.query;
        const clientVersion = parseInt(version);
        const query = {};
    
        // Add status to the query
        if (status) {
            query.status = status;
        }
    
        // Add masterProfile to the query
        if (masterProfile) {
            query.masterProfile = masterProfile;
        }

        const data = await getAllTournamentsFilteredService(query);
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

const updateTournamentApproval = async (req, res, next) => {
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
        const result = await updateTournamentApprovalService(id, req.body);
    
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
        
        if(result.settings.competitionMode === 'knockout'){
            const result3 = await deleteTournamentBracketByIdService(id);
        }
    
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

const getBracket = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getBracketService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Bracket Not found",
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

const getCredentials = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const data = await getCredentialsService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 500;
            response.error = { 
                code: 500, 
                message: "No tournament found",
                target: "approx what the error came from", 
            }
        }else{
            if(!data.roomId || !data.roomPassword){
                response.success = false;
                response.status = 400;
                response.error = {
                    code: 400,
                    message: "Credentials Not Announced",
                    target: "database"
                }
            }else{
                response.data = data;
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

const updateCredentials = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
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
        response.data = result;
        response.message = "Credentials updated successfully";
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
                const tournament = await addUserToTournamentObjectLeaderboard(tId, uId);
                if(tournament){
                    const leaderboard = await addUserToLeaderboardService(tId, uId);
                    if(leaderboard){
                        if(tournament.settings.competitionMode === "knockout"){
                            const bracket = await bookUserToBracketSlotService(tId, uId);
                            console.log("Bracket Push", bracket)
                        }
                        const xpAdd = await updateXp(uId, 100); //adding xp to the users account
                        const purchaseItem = await addPurchasedItemToUserService(tId, uId);

                        if(purchaseItem){
                            response.data = leaderboard;
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
                }else{
                    response.success = false;
                    response.status = 400;
                    response.message = "Problem adding user to tournamnet leaderboard";
                    response.error = {
                        code: 400,
                        message: "Problem adding user to tournament leaderboard",
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

const getAllMasterTournaments = async (req, res, next) => {
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

        const data = await getAllMasterTournamentsService(req.params.id);
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

const getAllInternalTournaments = async (req, res, next) => {
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

        const data = await getAllInternalTournamentsService(req.params.id);
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

const addNewFile = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
        message: "Success",
    }

    const { Bucket, Key } = req.settings || {};
    const imageUrl = Bucket && Key ? `https://${Bucket}.s3.amazonaws.com/${Key}` : null;
    // https://e24reactor-s3-bucket.s3.amazonaws.com/images/tournaments/uuid-orginalname.png

    try {
        if(req.status === 200 && imageUrl){
            try {
                const tid =  req.params.id;
                const result = await addTournamentThumbnailService(tid, imageUrl);
                // console.log(result);

                response.data = {
                    imageUrl: imageUrl
                };
                response.message = "Tournament Image uploaded successfully";
                res.send(response);
            } catch (error) {
                
            }
        }else{
            response.success = false;
            response.status = 400;
            response.message = req.err;
            response.error = {
                code: 400,
                message: req.err || "Unknown error",
                target: "client side api calling issue"
            }

            res.send(response);
        }
    } catch (error) {
        response.success = false;
        response.status = 400;
        response.message = req.err;
        response.error = {
            code: 400,
            message: req.err || error.message,
            target: "client side api calling issue"
        }

        res.send(response);
    }
};

module.exports = {
    getAllTournaments,
    getAllTournamentsFiltered,
    getTournamentDetails,
    updateTournamentDetails,
    deleteTournamentDetails,
    updateTournamentApproval,
    addANewTournament,
    getLeaderboards,
    getBracket,
    getCredentials,
    updateCredentials,
    tournamentRegistration,
    getAllMasterTournaments,
    getAllInternalTournaments,
    addNewFile
}