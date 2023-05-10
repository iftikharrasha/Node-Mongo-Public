const _ = require('lodash');
const { generateToken, generateRefreshToken } = require("../utils/token");
const { userSignupService, findUserByEmail, findUserById, updateProfileByIdService, deleteProfileByIdService, userLoginService, getUserProfileService } = require("../services/account.service");
const { deleteTransactionByIdService } = require('../services/wallet.service');

const userSignup = async (req, res) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }
    try {
        const user = await userSignupService(req.body);
        //   const token = user.generateConfirmationToken();
        //   await user.save({ validateBeforeSave: false });
    
        //   const mailData = {
        //     to: [user.email],
        //     subject: "Verify your Account",
        //     text: `Thank you for creating your account. Please confirm your account here: ${
        //       req.protocol
        //     }://${req.get("host")}${req.originalUrl}/confirmation/${token}`,
        //   };
    
        //   await sendMailWithMailGun(mailData);

        if(!user){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Could not create User",
                target: "service issue"
            }
        }else{
            const cleanedProfile = _.omit(user.toObject(), ['password']);
            response.data = cleanedProfile;
        }
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
                message: error._message,
                target: "schema expects valid format", 
            }
        });
    }
};

const userLogin = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }
    try{
        const { emailAddress, password } = req.body;

        if(!emailAddress || !password){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Please provide your credentials correctly",
                target: "client side api calling issue send"
            }
            res.status(400).send(response);
        }else{
            try{
                // const user = await userLoginService(emailAddress, password);
                const user = await findUserByEmail(emailAddress);
                
                if (!user) {
                    res.status(401).send({
                        success: false,
                        status: 401,
                        data: {},
                        signed_in: false,
                        version: 1,
                        error: { 
                            code: 500, 
                            message: "Invalid email address",
                            target: "Create an account", 
                        }
                    });
                } else {
                    const isPasswordValid = user.comparePassword(password, user.password);

                    if (!isPasswordValid) {
                        return res.status(401).send({
                            success: false,
                            status: 401,
                            data: {},
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "Invalid password",
                                target: "Create an account", 
                            }
                        });
                    }else if (user.status != "active") {
                        return res.status(401).send({
                            success: false,
                            status: 401,
                            data: {},
                            signed_in: false,
                            version: 1,
                            error: { 
                                code: 500, 
                                message: "Your account is not active yet",
                                target: "Verify your account", 
                            }
                        });
                    }else{
                        const token = generateToken(user);
                        const refreshToken = generateRefreshToken(user);

                        const cleanedProfile = _.omit(user.toObject(), ['password']);

                        response.signed_in = true;
                        response.jwt = token;
                        response.refreshToken = refreshToken;
                        response.data = cleanedProfile;

                        res.status(200).send(response);
                    }
                }
            } catch (err) {
                console.log(err);
                res.status(500).send({
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
};

const getUserProfile = async (req, res, next) => {
    try{
        let response = {
            success: true,
            status: 200,
            signed_in: false,
            version: 1,
            data: {},
            error: null
        }

        const clientVersion = parseInt(req.query.version);
        try {
            // const data = await getUserProfileService(id);
            const user = await findUserById(req.params.id);

            if (!user) {
                response.success = false;
                response.status = 404;
                response.error = {
                    code: 404,
                    message: "Profile details not found",
                    target: "database"
                }
            }else{
                try {
                    if (user.version > clientVersion) {
                        const cleanedProfile = _.omit(user.toObject(), ['password']);
                        response.data = cleanedProfile;
                        response.version = user.version;
                    }else {
                        response.status = 304;
                        response.version = clientVersion;
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
                        message: "An Internal Error Has Occurred",
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
                    message: "An Internal Error Has Occurred",
                    target: "approx what the error came from", 
                }
            });
        }

        res.send(response);
    }catch(err){
       next(err);
    }
};

const updateProfileById = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }

    try {
        const result = await updateProfileByIdService(req.params.id, req.body);

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
        response.message = "Profile updated successfully";

        res.send(response);
    } catch (error) {
        console.log(err);
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

const deleteProfileById = async (req, res, next) => {
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

        const result = await deleteProfileByIdService(id);
        const result2 = await deleteTransactionByIdService(id);
    
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
        response.message = "Profile deleted successfully";
        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 500;
        response.message = "Data is not deleted";
        response.error = {
            code: 500,
            message: error.message,
            target: "client side api calling issue"
        }

        res.status(500).send(response);
    }
};

module.exports = {
    userSignup,
    userLogin,
    getUserProfile,
    updateProfileById,
    deleteProfileById,
}