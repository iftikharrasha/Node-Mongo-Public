const { getTopupsService, getTopupByIdService, createTopupService, updateTopupByIdService, deleteTopupByIdService } = require("../services/wallet.service");
const { getVersionTableService } = require("../services/versionTable.service");
const { ObjectId } = require("mongodb");

const getTopups = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try{
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
                const data = await getTopupsService();
                const versionData = await getVersionTableService();

                if (data.length > 0) {
                    try {
                        let serverVersion = 0;
                        const tableData = versionData.find( item => item.table === "topups");
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

const getTopupById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
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
                    const data = await getTopupByIdService(id);
        
                    if(!data){
                        response.success = false;
                        response.status = 400;
                        response.error = {
                            code: 400,
                            message: "Topup Details Not found!",
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
            }
            res.send(response);
        }
    } catch (error) {
        next(err);
    }
};

const createTopup = async (req, res) => {
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
        const result = await createTopupService(req.body);

        response.data = result;
        response.message = "Giftcard created successfully";

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

const updateTopupById = async (req, res, next) => {
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
    
        const result = await updateTopupByIdService(id, req.body);
    
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
        response.message = "Giftcard updated successfully";
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

const deleteTopupById = async (req, res, next) => {
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
    
        const result = await deleteTopupByIdService(id);
    
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
        response.message = "Giftcard deleted successfully";
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

module.exports = {
    getTopups,
    getTopupById,
    createTopup,
    updateTopupById,
    deleteTopupById
}