const express = require('express');
const cors = require('cors');

const accountRoute = require('./src/routes/v1/account.route.js');
const tournamentRoute = require('./src/routes/v1/tournament.route.js');
const teamRoute = require('./src/routes/v1/team.route.js');
const staticRoute = require('./src/routes/v1/statics.route.js');
const walletRoute = require('./src/routes/v1/wallet.route.js');
const errHandler = require('./src/middlewares/errHandler.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/account", accountRoute)
app.use("/api/v1/tournament", tournamentRoute)
app.use("/api/v1/statics", staticRoute)
app.use("/api/v1/team", teamRoute)
app.use("/api/v1/wallet", walletRoute)

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