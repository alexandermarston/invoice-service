const express = require('express')
const createInvoice = require('../middleware/createInvoice')
const getInvoice = require('../middleware/getInvoice')

module.exports = express.Router()
    .get('/invoice', getInvoice)
    .post('/invoice', createInvoice)
