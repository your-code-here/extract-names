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
    commaRegex,
    isEmpty,
    isEqual,
    splitByComma,
    clearRole
} = require('./common')

module.exports = function process(fileObj, options) {
    console.log('\x1b[44m%s\x1b[0m',`>>> ${fileObj.fileName} is processing... <<<`)
    return new Promise((resolve, reject) => {
        const {
            DATASET_DIR_NAME,
            OUTPUT_DIR_NAME,
            EXCLUDE_NAMES
        } = options;

        let output = [];
        const filter = new nameFilter(EXCLUDE_NAMES);

        const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
        const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);

        /**
         * PARSER
         */
        const parser = parse(record => {
            record = _.pick(record, fileObj.cols);
            record = _.mapValues(record, o => _.split(o,/[,、;\/\n]/gi));
            record = _.zip(record[fileObj.cols[0]], record[fileObj.cols[1]]);
            return record;
        }).on('data', data => {
            output = _.concat(output, data);
        }).on('end', async () => {
            output = _.map(output, o => {
                return _.map(o, i => {
                    return isEmpty(i) ? '' : _.trim(clearRole(i));
                })
            });
            output = _.filter(output, o => !isEmpty(o[0]) || !isEmpty(o[1]));
            output = _.uniqWith(output, _.isEqual);
            output = filter.apply(output);
            const result = await exportResult(output, ['Eng','Chi'], outputFilePath, false);
            resolve(result);
        });

        // READER STREAM
        fs.createReadStream(inputFilePath).pipe(parser);
    })
}