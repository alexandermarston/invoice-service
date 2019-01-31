const pdfKit = require('pdfkit')
const moment = require('moment')
const numeral = require('numeral')
const translations = require('./translations')
const logger = require('./logger');

const TEXT_SIZE = 8
const CONTENT_LEFT_PADDING = 50

function PDFInvoice({
    company, // {phone, email, address}
    customer, // {name, email}
    items, // [{amount, name, description}]
    total
}){
    const date = new Date()
    
    const charge = {
        createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
        amount: items.reduce((acc, item) => acc + item.amount, 0),
    }

    const doc = new pdfKit({size: 'A4', margin: 50});

    doc.fillColor('#333333');

    const translate = translations[PDFInvoice.lang]
    moment.locale(PDFInvoice.lang)

    const divMaxWidth = 550;
    const table = {
        x: CONTENT_LEFT_PADDING,
        y: 200,
        inc: 150,
    };

    return {
        generateHeader() {
            doc
                .fontSize(20)
                .text('INVOICE', CONTENT_LEFT_PADDING, 50);

            const borderOffset = doc.currentLineHeight() + 55;

            doc
                .fontSize(12)
                .fillColor('#cccccc')
                .text(moment().format('MMMM DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
                    align: 'right',
                })
                .fillColor('#333333');

            doc
                .strokeColor('#cccccc')
                .moveTo(CONTENT_LEFT_PADDING, borderOffset)
                .lineTo(divMaxWidth, borderOffset);
        },

        generateCustomerDetails() {
            doc
                .fontSize(TEXT_SIZE)
                .font('Helvetica-Bold')
                .text('Customer Details:', CONTENT_LEFT_PADDING, 85)

            doc
                .font('Helvetica')
                .text(customer.name, CONTENT_LEFT_PADDING, 95)

            doc.text(customer.address1, CONTENT_LEFT_PADDING, 105)
            doc.text(customer.address2, CONTENT_LEFT_PADDING, 115)
            doc.text(customer.town, CONTENT_LEFT_PADDING, 125)
            doc.text(customer.county, CONTENT_LEFT_PADDING, 135)
            doc.text(customer.postcode, CONTENT_LEFT_PADDING, 145)
        },

        generateCompanyDetails() {
            doc
                .fontSize(TEXT_SIZE)
                .font('Helvetica-Bold')
                .text('Business Details:', CONTENT_LEFT_PADDING, 85, {
                    align: 'right'
                })

            doc
                .font('Helvetica')
                .text(company.name, CONTENT_LEFT_PADDING, 95, {
                    align: 'right'
                })

            doc.text(company.address1, CONTENT_LEFT_PADDING, 105, { align: 'right', })
            doc.text(company.address2, CONTENT_LEFT_PADDING, 115, { align: 'right', })
            doc.text(company.town, CONTENT_LEFT_PADDING, 125, { align: 'right', })
            doc.text(company.county, CONTENT_LEFT_PADDING, 135, { align: 'right', })
            doc.text(company.postcode, CONTENT_LEFT_PADDING, 145, { align: 'right', })
        },

        generateTableHeaders() {
            [
                'name',
                'description',
                'quantity',
                'amount',
            ].forEach((text, i) => {
                doc
                    .fontSize(TEXT_SIZE)
                    .text(translate[text], table.x + i * table.inc, table.y);
            });
        },

        generateTableRow() {
            items
                .map(item => Object.assign({}, item, {
                    amount: '£' + numeral(item.amount).format('£ 0,00.00')
                }))
                .forEach((item, itemIndex, itemArray) => {
                    [
                        'name',
                        'description',
                        'quantity',
                        'amount',
                    ].forEach((field, i) => {
                        doc
                            .fontSize(TEXT_SIZE)
                            .text(item[field], table.x + i * table.inc, table.y + TEXT_SIZE + 6 + itemIndex * 20);
                    });

                    if (itemIndex === itemArray.length - 1) {
                        doc
                            .font('Helvetica-Bold')
                            .fontSize(TEXT_SIZE)
                            .text('Total', table.x + 0 * table.inc, table.y + TEXT_SIZE + 6 + (itemIndex + 1) * 20);

                        doc
                            .font('Helvetica-Bold')
                            .fontSize(TEXT_SIZE)
                            .text('£' + numeral(total).format('£ 0,00.00'), table.x + 3 * table.inc, table.y + TEXT_SIZE + 6 + (itemIndex + 1) * 20);
                    }
                })
        },

        generateTableLines() {
            const offset = doc.currentLineHeight() + 2;
            doc
                .moveTo(table.x, table.y + offset)
                .lineTo(divMaxWidth, table.y + offset)
                .stroke();
        },

        generate() {
            this.generateHeader();
            this.generateCustomerDetails();
            this.generateCompanyDetails();
            this.generateTableHeaders();
            this.generateTableLines();
            this.generateTableRow();

            doc.end();
        },

        get pdfkitDoc() {
            return doc
        },
    };
}

PDFInvoice.lang = 'en_GB'

module.exports = PDFInvoice
