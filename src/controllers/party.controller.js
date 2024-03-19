
const { createPartyService, getAllPartiesService, getPartyDetailsService, addPartyToUserService, getPartyEventsByIdService, addPartyAnswer, answerConnectToPartyService, getPartyPeoplelistService, addPostToPartyService, getPartySocialsByIdService, addCommentToPartyPostService, getPartySocialsCommentsByIdService } = require("../services/party.service");
const { getVersionTableService } = require("../services/versionTable.service");

const getAllParties = async (req, res, next) => {
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
                const data = await getAllPartiesService();
                const versionData = await getVersionTableService();

                if (data.length > 0) {
                    try {
                        let serverVersion = 0;
                        const tableData = versionData.find( item => item.table === "parties");
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

const getPartyDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getPartyDetailsService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Party Details Not found",
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

const getPartyEventsById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const clientVersion = parseInt(req.query.version);
        const data = await getPartyEventsByIdService(req.params.id);
        const versionData = await getVersionTableService();

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No party found!",
                target: "database"
            }
        }else{
            try {
                let serverVersion = 0;
                const tableData = versionData.find( item => item.table === "parties");
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

const addANewParty = async (req, res, next) => {
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
        const party = await createPartyService(req.body);
        if(party) {
            const partyOwner = await addPartyToUserService(req.body.owner, party._id.toString());
            if(partyOwner) {
                response.data = party;
                response.message = "Party created successfully";
        
                res.send(response);
            }else{
                response.success = false;
                response.status = 400;
                response.message = "Problem adding party owner to user object";
                response.error = {
                    code: 400,
                    message: "Problem adding party owner to user object",
                    target: "client side api calling issue"
                }
                res.send(response);
            }
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem creating the party";
            response.error = {
                code: 400,
                message: "Problem creating the party",
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

const addUserToParty = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null,
    }

    try {
        const result = await addPartyAnswer(req.body);

        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Party joining request is not created";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }
        const answered = await answerConnectToPartyService(req.params.id, result._id, req.user.sub);
        if(answered){
            response.data = answered;
            response.version = result.version;
            response.message = "Party join requested";

            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem adding answer to party object";
            response.error = {
                code: 400,
                message: "Problem adding answer to party object",
                target: "client side api calling issue"
            }
            res.send(response);
        }
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

const getPartySocialPostsId = async (req, res, next) => {
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
        const data = await getPartySocialsByIdService(id);

        if (data) {
            response.data = data;
            // response.version = data.version;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No party posts found!",
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

const addPostToParty = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null,
    }

    const { id } = req.params;

    try {
        const result = await addPostToPartyService(id, req.body);
        if (result) {
            response.data = result;
            response.version = result.version;
            response.message = "Your post has been published";

            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem adding post to party";
            response.error = {
                code: 400,
                message: "Problem adding post to party",
                target: "client side api calling issue"
            }
            res.send(response);
        }
    } catch (error) {
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

const addCommentToPartyPost = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null,
    }
    
    const { id } = req.params;
    const { postId } = req.query;

    try {
        const result = await addCommentToPartyPostService(id, postId, req.body);
        
        if (result) {
            response.data = result;
            response.version = result.version;
            response.message = "Your comment has been added";

            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem adding comment to post";
            response.error = {
                code: 400,
                message: "Problem adding comment to post",
                target: "client side api calling issue"
            }
            res.send(response);
        }
    } catch (error) {
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

const getPartySocialsCommentsById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }

    const { id } = req.params;
    const { postId } = req.query;
    console.log(id, postId)

    try {
        const data = await getPartySocialsCommentsByIdService(id, postId);

        if (data) {
            response.data = data;
            // response.version = data.version;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No post comments found!",
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

const getPartyPeoplelist = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try {
        const data = await getPartyPeoplelistService(req.params.id);

        if (data) {
            response.data = data;
            // response.version = data.version;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No Party members found!",
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

module.exports = {
    // getAllTeams,
    // getMyTeamsById,
    addANewParty,
    getAllParties,
    getPartyDetails,
    getPartyEventsById,
    addUserToParty,
    getPartyPeoplelist,
    addPostToParty,
    getPartySocialPostsId,
    addCommentToPartyPost,
    getPartySocialsCommentsById
}