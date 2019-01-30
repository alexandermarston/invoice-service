const express = require('express')
const createInvoice = require('../middleware/createInvoice')

module.exports = express.Router()
    .post('/invoice', createInvoice)
