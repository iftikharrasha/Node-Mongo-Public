const { createSupportTicketService, getMySupportTicketsService, getSupportTicketDetailsService, createSupportCommentService, getAllSupportTicketsService, updateSupportStatusService } = require("../services/support.service.js");

const getMySupportTickets = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
            
    try {
        const data = await getMySupportTicketsService(req.params.id);
        response.data = data;
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
                target: "approx what the error came from", 
            }
        });
    }
}

const getAllSupportTickets = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
            
    try {
        const data = await getAllSupportTicketsService(req.params.id);
        response.data = data;
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
                target: "approx what the error came from", 
            }
        });
    }
}

const getSupportTicketDetails = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
            
    try {
        const data = await getSupportTicketDetailsService(req.params.id);
        response.data = data;
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
                target: "approx what the error came from", 
            }
        });
    }
}

const createSupportTicket = async (req, res, next) => {
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
        const support = await createSupportTicketService(req.body);
        if(support){
            response.data = support;
            response.message = "Ticket created successfully";
    
            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem creating the ticket";
            response.error = {
                code: 400,
                message: "Problem creating the ticket",
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

const createSupportComment = async (req, res, next) => {
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
        const result = await createSupportCommentService(id, req.body);
        
        if (result) {
            response.data = result;
            response.version = result.version;
            response.message = "Your comment has been added";

            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem adding comment to support";
            response.error = {
                code: 400,
                message: "Problem adding comment to support",
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

const updateSupportStatus = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
        message: null,
    }
    const { id } = req.params;
    
    try {
        // save or create
        const support = await updateSupportStatusService(id, req.user.sub);
        if(support){
            response.data = support;
            response.message = "Ticket status updated successfully";
    
            res.send(response);
        }else{
            response.success = false;
            response.status = 400;
            response.message = "Problem updating the ticket";
            response.error = {
                code: 400,
                message: "Problem creating the ticket",
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

module.exports = {
    getMySupportTickets,
    getAllSupportTickets,
    getSupportTicketDetails,
    createSupportTicket,
    createSupportComment,
    updateSupportStatus
}