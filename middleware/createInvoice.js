const pdfInvoice = require('../lib/pdfinvoice');
const S3 = require('aws-sdk/clients/s3');
const logger = require('../lib/logger');

// Initialise the S3 Bucket for PDF storage
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = async (req, res, next) => {
    logger.info('Client requesting the creation of an invoice');

    // Calculate the total Invoice amount
    const totalAmount = (req.body.items).reduce(function (a, b) {
        return { sum: a.amount + b.amount };
    });

    try {
        // Create contents of Invoice
        const pdfDocument = pdfInvoice({
            company: {
                name: req.body.company.name,
                address: req.body.company.address,
                email: req.body.company.email,
                phone: req.body.company.phone
            },
            customer: {
                name: req.body.customer.name,
                email: req.body.customer.email
            },
            items: req.body.items,
            total: totalAmount.sum
        });

        // Generate the PDF document
        pdfDocument.generate();
        pdfDocument.pdfkitDoc.pipe(res);

        logger.info('Succesfully generated Invoice PDF')
    } catch (error) {
        logger.error('Failed to generate an invoice. Error: ' + error)
        res.boom.badRequest(error);
    }

    //res.sendStatus(200)
}
