const _ = require('lodash');
const { generateToken, generateRefreshToken } = require("../utils/token");
const { userSignupService, findUserByEmail, findUserById, updateProfileByIdService, deleteProfileByIdService, userLoginService, getUserProfileService, getUsersListService, addGameAccountService, friendRequestService, getfriendlistService, gameAccountConnectToUser, updateXp, addNewBadgeService, getBadgeListService, updateSiteBadgeService, addUsersBadgeService, verifyTeamMemberAddService } = require("../services/account.service");
const { deleteTransactionByIdService } = require('../services/wallet.service');
const { getVersionTableService } = require('../services/versionTable.service');

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
            const usersbadge = await addUsersBadgeService(user._id, user.userName, "create_account");
            console.log(usersbadge.badge)

            if(!usersbadge.success){
                console.log(usersbadge.message)
            }

            const cleanedProfile = _.omit(user.toObject(), ['password']);
            response.data = cleanedProfile;
        }
        res.send(response);
    } catch (error) {
        console.log(error);
        if (error.name === "MongoServerError" && error.code === 11000) {
            res.send({
                success: false,
                status: 500,
                data: null,
                signed_in: false,
                version: 1,
                error: {
                  code: 400,
                  message: "Username already exists",
                  target: "userName"
                }
            });
        } 
        else if (error.name === "ValidationError") {
            const errors = {};
            // extract first error message from errors object
            const errorKeys = Object.keys(error.errors);
            if (errorKeys.length > 0) {
                errors[errorKeys[0]] = error.errors[errorKeys[0]].message;
            }

            res.send({
                success: false,
                status: 500,
                data: null,
                signed_in: false,
                version: 1,
                error: { 
                    code: 500, 
                    message: errors[errorKeys[0]],
                    target: "schema expects valid format 2", 
                }
            });
        }else {
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
            res.send(response);
        }else{
            try{
                // const user = await userLoginService(emailAddress, password);
                const user = await findUserByEmail(emailAddress);
                
                if (!user) {
                    res.send({
                        success: false,
                        status: 400,
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
                        return res.send({
                            success: false,
                            status: 400,
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
                        return res.send({
                            success: false,
                            status: 400,
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
                        // const usersbadge = await addUsersBadgeService(user._id, user.userName, "create_account");
                        // console.log(usersbadge.badge)
            
                        // if(!usersbadge.success){
                        //     console.log(usersbadge.message)
                        // }

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

        response.data = result;
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

const verifyTeamMemberAdd = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        message: null,
        error: null
    }

    try {
        const result = await verifyTeamMemberAddService(req.params.id, req.body);
        response.success = result.success;
        response.message = result.message;
        response.data = result.members;
        res.send(response);
    } catch (error) {
        response.success = false;
        response.status = 500;
        response.message = "An Internal Error Has Occurred";
        response.error = {
            code: 500,
            message: error.message,
            target: "approx what the error came from",
        };

        res.send(response);
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

const getUsersList = async (req, res, next) => {
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

        const data = await getUsersListService(req.params.id);
        const versionData = await getVersionTableService();

        if (data.length > 0) {
            try {
                let serverVersion = 0;
                const tableData = versionData.find( item => item.table === "users");
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
                message: "No users found!",
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

const addGameAccount = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null,
        xp: null
    }

    try {
        const result = await addGameAccountService(req.params.id, req.body);

        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Game account is not created";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }
        const connected = await gameAccountConnectToUser(req.params.id, result._id);
        if(connected){
            const usersbadge = await addUsersBadgeService(req.user.sub, req.user.name, "gaming_machine");
            console.log(usersbadge.badge)

            if(!usersbadge.success){
                console.log(usersbadge.message)
            }

            const xpToBeAdded = 200;
            const xpAdd = await updateXp(req.params.id, xpToBeAdded, 0, 0); //adding xp to the users account
            if(xpAdd.success){
                response.xp = [
                    `You've successfully added your game account`,
                    `Unlocking XP points..`,
                    `You've earned +${xpToBeAdded} XP points`
                ]
            }

            const cleanedResult = _.omit(result.toObject(), ['version', 'uId', 'updatedAt', 'createdAt', '__v']);
            response.data = cleanedResult;
            response.version = result.version;
            response.message = "Game account created successfully";
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
                message: "An Internal Error Has Occurred",
                target: "approx what the error came from", 
            }
        });
    }
};

const friendRequest = async (req, res, next) => {
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
        const result = await friendRequestService(req.body);

        if (!result.success) {
            response.success = false;
            response.status = 400;
            response.message = "Friend requst having an issue";
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

const getfriendlist = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }
    try {
        const data = await getfriendlistService(req.params.id);

        if (data) {
            response.data = data;
            // response.version = data.version;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No friends found!",
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

const addNewBadge = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }

    try {
        const result = await addNewBadgeService(req.params.id, req.body);

        if (!result) {
            response.success = false;
            response.status = 400;
            response.message = "Badge is not created";
            response.error = {
                code: 400,
                message: error.message,
                target: "client side api calling issue"
            }

            return res.send(response);
        }
        response.data = result;
        response.version = result.version;
        response.message = "Badge created successfully";

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

const getBadgeList = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: [],
        error: null
    }

    try {
        const data = await getBadgeListService(req.params.id);

        if (data) {
            response.data = data;
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No badges found!",
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

const claimMyBadge = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {
            badge: null,
            stats: null,
        },
        error: null,
        stats: null
    }

    try {
        const usersbadge = await addUsersBadgeService(req.user.sub, req.user.name, req.params.slag);
        console.log("message", usersbadge.message)
        console.log("2. stats", usersbadge.stats)
        
        if(!usersbadge.success){
            console.log("3. stats", usersbadge.stats)
            response.data = {
                badge: usersbadge.badge.toObject(),
                stats: usersbadge.stats ? usersbadge.stats.toObject() : null,
            };
        }else{
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "Can not claim the badge!",
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

const updateSiteBadge = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        signed_in: false,
        version: 1,
        data: {},
        error: null
    }

    try {
        const result = await updateSiteBadgeService(req.params.id, req.body);

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
        response.version = result.version;
        response.message = "Badge updated successfully";

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
                message: "An Internal Error Has Occurred",
                target: "approx what the error came from", 
            }
        });
    }
};

module.exports = {
    userSignup,
    userLogin,
    getUserProfile,
    updateProfileById,
    deleteProfileById,
    getUsersList,
    addGameAccount,
    friendRequest,
    getfriendlist,
    addNewBadge,
    getBadgeList,
    updateSiteBadge,
    claimMyBadge,
    verifyTeamMemberAdd
}