const { ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const _ = require('lodash');
const { userSignupService, userLoginService, getUserProfileService } = require("../services/account.service");
// const { generateToken } = require("../utils/token");

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
            response.data = user;
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

        if(!emailAddress){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Missing email in the body parameter!",
                target: "client side api calling issue send"
            }
            res.send(response);
        }else if(!password){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Missing password in the body parameter!",
                target: "client side api calling issue send"
            }
            res.send(response);
        }else{

            try{
                const user = await userLoginService(emailAddress, password);
                
                if (!user) {
                    res.send({
                        success: false,
                        status: 401,
                        data: {},
                        signed_in: false,
                        version: 1,
                        error: { 
                            code: 500, 
                            message: "Invalid Username and Password!",
                            target: "approx what the error came from", 
                        }
                    });
                } else {
                    const secret = process.env.APP_PASSWORD;
                    const options = { expiresIn: '24h' };
                    const payload = {
                        sub: user._id,
                        name: user.userName,
                        email: user.emailAddress,
                        typ: user.permissions,
                        photo: user.photo,
                    };

                     // Create a access token
                    const token = jwt.sign(payload, secret, options);

                     // Create a refresh token
                     const refreshToken = uuid.v4();  //need expiration time


                    response.signed_in = true;
                    response.data = {
                        jwt: token,
                        refreshToken: refreshToken,
                        user: user
                    };
                    res.send(response);
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
        }
    }catch(err){
       next(err);
    }
}

const getUserProfile = async (req, res, next) => {
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
            const id = req.params.id;
            if(!ObjectId.isValid(id)){
                response.status = 400;
                response.signed_in = false,
                response.error = {
                    code: 400,
                    message: "Not a valid profile id!",
                    target: "client side api calling issue"
                }
                res.send(response);
            }else{
                const clientVersion = parseInt(req.query.version);
                try {
                    const data = await getUserProfileService(id);
    
                    if (!data) {
                        response.success = false;
                        response.status = 404;
                        response.error = {
                            code: 404,
                            message: "Tournament details not found!",
                            target: "database"
                        }
                    }else{
                        try {
                            if (data.version > clientVersion) {
                                const cleanedProfile = _.omit(data, ['password']);
                                response.data = cleanedProfile;
                                response.version = data.version;
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
        }
    }catch(err){
       next(err);
    }
}

module.exports = {
    userSignup,
    userLogin,
    getUserProfile,
}