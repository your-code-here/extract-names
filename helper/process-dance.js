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
} = require('./common');


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
        on_record: record => _.pick(record, fileObj.cols)
    }).on('data', data => {
        data = Object.values(data);
        data = _.chunk(data,2);
        data = _.filter(data, o => !isEmpty(_.head(o)) || !isEmpty(_.last(o)));
        data = _.map(data, o => {
            let chi = _.replace(o[0], /\s{5,}/gi, ',');
            chi = splitByComma(chi);
            chi = _.map(chi, clearRole);
            let eng = _.replace(o[1], /\s{5,}/gi, ',');
            eng = splitByComma(eng);
            eng = _.map(eng, clearRole);
            return [eng, chi];
        });

        data = _.map(data, o => {
            return _.zipWith(o[0], o[1],function (eng, chi) {
                return [eng, chi];
            });
        })

        data = _.flatten(data);
        // console.log(data);

        output = _.concat(output, data);
    }).on('end', function () {
        output = _.uniqWith(output, _.isEqual);
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
            columns: {
                eng: 'Eng',
                chi: 'Chi'
            }
        }, function (err, output) {
            if (err) throw err;
            fs.writeFile(outputFilePath, output, (err) => {
                if (err) throw err;
                console.log(`${outputFilePath} saved. [Result: ${result.length}]`);
            });
        });
    }

    // READER STREAM
    const readerStream = fs.createReadStream(inputFilePath);
    readerStream.pipe(parser);
}