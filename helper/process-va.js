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
            record = _.pick(record, fileObj.cols);
            record = _.mapValues(record, o => _.split(o,/[,、,;\/\n]/gi));
            record = _.zip(record[fileObj.cols[0]], record[fileObj.cols[1]]);
            return record;
        }
    }).on('data', data => {
        output = _.concat(output, data);
    }).on('end', () => {
        output = _.map(output, o => {
           return _.map(o, i => {
               return isEmpty(i) ? '' : _.trim(i);
           })
        });
        output = _.filter(output, o => !isEmpty(o[0]) || !isEmpty(o[1]));
        output = _.uniqWith(output, _.isEqual);
        exportResult(output);
    });

    /**
     * EXPORT
     * @param result
     */
    const exportResult = function (result) {
        // console.log(result);
        // STRINGIFIER OUTPUT
        stringify(result, {
            header: true,
            columns: ['Eng','Chi']
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