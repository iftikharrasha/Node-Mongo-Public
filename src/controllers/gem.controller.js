const { getGemPriceService } = require("../services/gem.service");

const getGemPrice = async (req, res, next) => {
    let response = {
        success: true,
        status: 200,
        version: 1,
        data: {},
        error: null,
    }
    try {
        const data = await getGemPriceService(req.params.id);

        if(!data){
            response.success = false;
            response.status = 400;
            response.error = {
                code: 400,
                message: "No data found!",
                target: "database"
            }
        }else{
            response.data = data;
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

// const createStatic = async (req, res, next) => {
//     let response = {
//         success: true,
//         status: 200,
//         version: 1,
//         data: {},
//         error: null,
//         message: "Success",
//     }
//     try {
//     // save or create
//         const result = await createStaticService(req.body);

//         response.data = result;
//         response.message = "Static created successfully";

//         res.send(response);
//     } catch (error) {
//         response.success = false;
//         response.status = 400;
//         response.message = "Data is not inserted";
//         response.error = {
//             code: 400,
//             message: error.message,
//             target: "client side api calling issue"
//         }

//         res.send(response);
//     }
// };

module.exports = {
    getGemPrice,
}