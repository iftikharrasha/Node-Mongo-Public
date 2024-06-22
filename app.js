const express = require('express');
const cors = require('cors');

const accountRoute = require('./src/routes/v1/account.route.js');
const tournamentRoute = require('./src/routes/v1/tournament.route.js');
const teamRoute = require('./src/routes/v1/team.route.js');
const partyRoute = require('./src/routes/v1/party.route.js');
const staticRoute = require('./src/routes/v1/statics.route.js');
const gemRoute = require('./src/routes/v1/gem.route.js');
const walletRoute = require('./src/routes/v1/wallet.route.js');
const uploadRoute = require('./src/routes/v1/upload.route.js');
const supportRoute = require('./src/routes/v1/support.route.js');
const errHandler = require('./src/middlewares/errHandler.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/account", accountRoute)
app.use("/api/v1/tournaments", tournamentRoute)
app.use("/api/v1/statics", staticRoute)
app.use("/api/v1/geminy", gemRoute)
app.use("/api/v1/teams", teamRoute)
app.use("/api/v1/party", partyRoute)
app.use("/api/v1/wallet", walletRoute)
app.use("/api/v1/upload", uploadRoute)
app.use("/api/v1/support", supportRoute)

app.get('/', (req, res) => {
    res.send('Server is loading on webhost!');
})
app.all('*', (req, res) => {
    res.send('No routes found!');
})

//global error handler
app.use(errHandler);

//if app fails to load
// process.on("unhandledRejection", (error) => {
//     app.close(() => {
//         process.exit(1)
//     })
// })

module.exports = app;