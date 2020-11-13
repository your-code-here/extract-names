/***********************\
 *      IMPORT
 \***********************/

const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const transform = require('stream-transform')
const stringify = require('csv-stringify')
const _ = require('lodash')

const {
    commaRegex,
    isEmpty,
    isEqual,
    splitByComma,
    clearRole
} = require('./common')

module.exports = function process(fileObj, options) {
    // OPTIONS
    const {
        DATASET_DIR_NAME,
        OUTPUT_DIR_NAME
    } = options;

    // PATHS
    const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
    const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);

    // PARSER
    let output = [];

    /**
     * PARSER
     */
    const parser = parse({
        bom: true,
        relax: true,
        columns: true,
        delimiter: ',',
        ltrim: true,
        rtrim: true,
        // from_line: 1,
        // to_line: 200,
        on_record: record => {
            record = _.compact(_.split(_.get(record, 'Event'),commaRegex));
            record = _.map(record,clearRole)
            return record;
        }
    }).on('data', data => {
       output = _.concat(output, data);
    }).on('end', () => {
        output = _.uniqWith(output, _.isEqual);
        output = _.zip(output);
        exportResult(output);
    });

    /**
     * EXPORT
     * @param result
     */
    const exportResult = function (result) {
        console.log(result);
        // STRINGIFIER OUTPUT
        stringify(result, {
            header: true,
            columns: ['Name']
        }, function (err, output) {
            if (err) throw err;
            fs.writeFile(outputFilePath, output, (err) => {
                if (err) throw err;
                console.log(`${outputFilePath} saved. [Result: ${result.length}]`);
            });
        });
    }

    // READER STREAM
    fs.createReadStream(inputFilePath).pipe(parser);
}