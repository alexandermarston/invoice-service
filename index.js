const express = require('express');
const boom = require('express-boom');
const Boom = require('boom');
const logger = require('./lib/logger');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const bugsnag = require('@bugsnag/js');
const bugsnagExpress = require('@bugsnag/plugin-express');
const mainRouter = require('./routes/main');

const bugsnagClient = bugsnag(process.env.BUGSNAG_KEY)
bugsnagClient.use(bugsnagExpress)

// Set Express Port
const port = 3000 | process.env.PORT

// Initialise express
const app = express()

// Initialise the bugsnag middleware
const middleware = bugsnagClient.getPlugin('express');

// Boom response objects in Express.
app.use(boom());

// Parse incoming bodies
app.use(bodyParser.json());

// Use the Express Validator module
app.use(expressValidator());

// Handle errors in downstream middleware
app.use(middleware.requestHandler);

// Handle errors in Express
app.use(middleware.errorHandler);

// Use the Main Router
app.use('/', mainRouter);

// Handle any missing resources
app.use(function (req, res, next) {
    res.boom.notFound('The specified resource was not found')
})

// Handle any stacktraces
app.use(function (err, req, res, next) {
    console.error(err.stack)
    const { output } = Boom.boomify(err);
    return res.status(output.statusCode).json(output.payload);
})

// Listen on specified port
app.listen(port, () => {
    logger.info('Application listening on port ' + port)
});
