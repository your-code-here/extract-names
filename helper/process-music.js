/***********************\
 *      IMPORT
 \***********************/

const fs = require('fs')
const path = require('path')
const parse = require('./parse')
const exportResult = require('./export-result')
const nameFilter = require('./name-filter')
const {
    splitByComma,
    isEmpty
} = require('./common')
const transform = require('stream-transform')
const _ = require('lodash')

module.exports = function process(fileObj, options) {
    console.log('\x1b[44m%s\x1b[0m',`>>> ${fileObj.fileName} is processing... <<<`)
    return new Promise((resolve, reject) => {
        // OPTIONS
        const {
            DATASET_DIR_NAME,
            OUTPUT_DIR_NAME,
            EXCLUDE_ROLES,
            EXCLUDE_NAMES
        } = options;

        let output = []
        const filter = new nameFilter(EXCLUDE_NAMES);
        const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
        const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);

        // PARSER
        const parser = parse(record => {
            record = _.pick(record, fileObj.cols);
            record = _.mapValues(record, o => _.compact(_.split(o,/[;\n]+/gi)));
            const record_1 = _.zip(record[fileObj.cols[0]], record[fileObj.cols[1]]);
            const record_2 = _.zip(record[fileObj.cols[2]], record[fileObj.cols[3]]);
            record = _.concat(record_1, record_2);
            record = _.map(record, i => {
                return _.map(i, j => {
                        return _.split(j, /[：:︰﹕]/gi, 2);
                })
            });

            record = _.reject(record, o => {
                /*
                  o = [
                        [ 'Presenter', ' Hong Kong Philharmonic Orchestra' ],
                        [ '主辦', '香港管弦樂團' ]
                  ];
                 */
                return _.some(o, i => {
                    // i = [ 'Presenter', ' Hong Kong Philharmonic Orchestra' ];
                    // i = [ '主辦', '香港管弦樂團' ]
                    return _.some(EXCLUDE_ROLES, reg => {
                        return reg.test(i[0])
                    })
                })
            });

            record = _.map(record, o => [_.trim(_.last(o[0])), _.trim(_.last(o[1]))])
            record = _.reject(record, o => {
                return _.every(o, isEmpty);
            })

            // console.log(record);
            // record = _.zip(record[fileObj.cols[0]], record[fileObj.cols[1]]);
            return record;
        }).on('data', data => {
            data = _.map(data, o => {
               let _tmp = _.map(o, splitByComma);
                _tmp = _.unzip(_tmp);
                // console.log("\n----\n",_tmp)
                return _tmp;
            });
            output = _.concat(output, data);
        }).on('end', async () => {
            output = _.flatten(output);
            output = _.map(output, o => _.map(o, _.trim));
            output = _.uniqWith(output, _.isEqual);
            output = filter.apply(output);
            const result = await exportResult(output, ['Eng','Chi'], outputFilePath, false);
            resolve(result);
        });

        // READER STREAM
        fs.createReadStream(inputFilePath).pipe(parser);
    })
}