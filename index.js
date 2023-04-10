const dotenv = require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const dbConnect = require('./src/utils/dbConnect.js');
const accountRoute = require('./src/routes/v1/account.route.js');
const tournamentRoute = require('./src/routes/v1/tournament.route.js');
const teamRoute = require('./src/routes/v1/team.route.js');
const staticRoute = require('./src/routes/v1/statics.route.js');
const walletRoute = require('./src/routes/v1/wallet.route.js');
const errHandler = require('./src/middlewares/errHandler');
const { createSocketServer } = require('./src/utils/socket.js');

const port = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

dbConnect.connectToServer((err) => {
    if(!err){
        const io = createSocketServer(server, process.env.REACT_APP_CLIENT_ORIGIN, 120000); // set the timeout to 2 minutes
        app.listen(port, () => console.log(`App is running on port ${port}`));
    }else{
        console.log(err)
    }
}) 

app.use("/api/v1/account", accountRoute)
app.use("/api/v1/tournament", tournamentRoute)
app.use("/api/v1/statics", staticRoute)
app.use("/api/v1/team", teamRoute)
app.use("/api/v1/wallet", walletRoute)

app.get('/', (req, res) => {
    res.send('Server is loading on webhost!');
})

// app.all('*', (req, res) => {
//     res.send('No routes found!');
// })

// //global error handler
// app.use(errHandler);

// //if app fails to load
// process.on("unhandledRejection", (error) => {
//     app.close(() => {
//         process.exit(1)
//     })
// })