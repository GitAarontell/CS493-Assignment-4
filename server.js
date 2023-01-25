const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routerBoats = require('./boatRoutes');
const routerLoads= require('./loadRoutes');

app.enable('trust proxy');
app.use(bodyParser.json());

// to be deleted later ////////////////////////////////////
const path = require(`path`);
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});
///////////////////////////////////////////////////////////
app.use('/boats', routerBoats);

app.use('/loads', routerLoads);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});