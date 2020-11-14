const parse = require('csv-parse')

/**
 *
 * @param {function} on_record
 * @returns {*|parse.Parser}
 */
module.exports = function parseDataToStream(on_record) {
    return parse({
        bom: true,
        relax: true,
        columns: true,
        delimiter: ',',
        ltrim: true,
        rtrim: true,
        // from_line: 1,
        // to_line: 300,
        on_record
    })
}