/***********************\
 *      IMPORT
 \***********************/

const fs = require('fs')
const path = require('path')
const parse = require('./parse')
const exportResult = require('./export-result')
const nameFilter = require('./name-filter')
const _ = require('lodash')

const {
    clearRole
} = require('./common')

module.exports = function process(fileObj, options) {
    console.log('\x1b[44m%s\x1b[0m',`>>> ${fileObj.fileName} is processing... <<<`)
    return new Promise((resolve, reject) => {
        // OPTIONS
        const {
            DATASET_DIR_NAME,
            OUTPUT_DIR_NAME,
            EXCLUDE_NAMES
        } = options;

        let output = [];
        const filter = new nameFilter(EXCLUDE_NAMES);

        // PATHS
        const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
        const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);

        /**
         * PARSER
         */
        const parser = parse(record => {
            record = _.get(record, 'Event');
            record = _.compact(_.split(record,/[,、;\n]+/gi));
            record = _.map(record, clearRole)
            return record;
        }).on('data', data => {
            output = _.concat(output, data);
        }).on('end', async () => {
            output = _.uniqWith(output, _.isEqual);
            output = _.zip(output);
            output = filter.apply(output);
            const result = await exportResult(output, ['Name'], outputFilePath, false);
            resolve(result);
        });

        // READER STREAM
        fs.createReadStream(inputFilePath).pipe(parser);
    })
}