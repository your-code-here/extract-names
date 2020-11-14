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
} = require('./common');


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
        const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
        const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);

        /**
         * PARSER
         */

        const colPairs = _.chunk(fileObj.cols, 2);
        const parser = parse(record => {
            record = _.pick(record, fileObj.cols);
            record = _.mapValues(record, o => {
                let _tmp = _.replace(o, /\s{5,}/gi, ',');
                _tmp = splitByComma(_tmp);
                _tmp = _.map(_tmp, i =>{
                    i = clearRole(i);
                    return _.trim(i);
                })
                return _tmp;
            })

            record = _.reduce(colPairs, (result, colPair) => {
                const arrChi = _.get(record,colPair[0],[]);
                const arrEng = _.get(record,colPair[1],[]);
                return _.concat(result, _.unzip([arrEng, arrChi]))
            }, []);

            record = _.map(record, o => {
               return _.map(o, i => {
                   return isEmpty(i) ? '' : _.trim(i);
               })
            });

            record = _.reject(record, o => {
                return _.every(o, isEmpty);
            });

            return record;
        }).on('data', data => {
            output = _.concat(output, data);
        }).on('end', async () =>{
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