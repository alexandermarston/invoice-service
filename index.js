const express = require('express');
const boom = require('express-boom');
const Boom = require('boom');
const winston = require('winston');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');
const mainRouter = require('./routes/main')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: {
        service: 'invoice-service'
    }
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const port = 3000 | process.env.PORT

const app = express()

// Boom response objects in Express.
app.use(boom());

// Parse incoming bodies
app.use(bodyParser.urlencoded({ extended: false}));

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
    logger.info("Application listening on port " + port)
});
