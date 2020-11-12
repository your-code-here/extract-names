/***********************\
 *      IMPORT
 \***********************/

const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const transform = require('stream-transform')
const stringify = require('csv-stringify')
const _ = require('lodash')

const commaRegex = /[,、,]/i;

const isEmpty = function (value) {
    if (!value) return true;
    value = _.trim(value);
    return ['', 'nil', '.'].includes(value);
}

const isEqual = function (str1, str2) {
    str1 = _.trim(_.toLower(str1));
    str2 = _.trim(_.toLower(str2));
    return str1 === str2;
}

module.exports = function process(fileObj, options) {
    // OPTIONS
    const {
        DATASET_DIR_NAME,
        OUTPUT_DIR_NAME,
        EXCLUDE_ROLES,
        EXCLUDE_NAMES
    } = options;

    // PATHS
    const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
    const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);
    const resultFilePath = path.resolve(OUTPUT_DIR_NAME, 'final-' + fileObj.fileName);

    // OUTPUT
    let output = []

    // PARSER
    const parser = parse({
        bom: true,
        relax: true,
        columns: true,
        delimiter: ',',
        ltrim: true,
        rtrim: true,
        // from_line: 1,
        // to_line: 100,
        on_record: record => _.pick(record, fileObj.cols)
    });

    const exportResult = function (result) {
        result = _.filter(result, o => {

            // If role empty
            if (isEmpty(o[0])) return false;

            // If eng and chi are empty
            if (isEmpty(o[1]) && isEmpty(o[2])) return false;

            return !_.some(EXCLUDE_NAMES, i => {
                if (!isEmpty(o[1])) {
                    if (isEqual(o[1], i)) return true;
                    if (new RegExp(i, 'i').test(o[1])) return true;
                }
                if (!isEmpty(o[2])) {
                    if (isEqual(o[2], i)) return true;
                    if (new RegExp(i, 'i').test(o[2])) return true;
                }
                return false;
            });

        })

        // console.log(result);

        // STRINGIFIER OUTPUT
        stringify(result, {
            header: true,
            columns: {
                role: 'Role',
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

        // STRINGIFIER FINAL RESULT
        let finalResult = _.map(result, o => _.tail(o));
        finalResult = _.uniqWith(finalResult, _.isEqual);
        stringify(finalResult, {
            header: true,
            columns: {
                eng: 'Eng',
                chi: 'Chi'
            }
        }, function (err, output) {
            if (err) throw err;
            fs.writeFile(resultFilePath, output, (err) => {
                if (err) throw err;
                console.log(`${resultFilePath} saved. [Result: ${finalResult.length}]`);
            });
        });
    }

    /**
     * EXTRACT DATA FROM STRING
     * @type {*|transform.Transformer}
     */
    const extractString = transform(function (data) {
        data = _.mapValues(data, function (o) {
            let parts = _.split(o, ';'); // Split by ;
            parts = _.compact(parts); // Remove false, 0, '' ...
            parts = _.map(parts, p => _.split(p, /[：:︰﹕]/, 2));
            return parts;
        });

        const PresEng = data[fileObj.cols[0]];
        const PresChi = data[fileObj.cols[1]];
        const WorkEng = data[fileObj.cols[2]];
        const WorkChi = data[fileObj.cols[3]];

        let output = [];

        for (let i = 0; i < _.size(PresEng); i++) {
            output.push(_.concat(PresEng[i], _.tail(PresChi[i])));
            output.push(_.concat(WorkEng[i], _.tail(WorkChi[i])));
        }

        return output;
    });

    /**
     * FILTER ROLES
     * @type {this}
     */
    const filterRoles = transform(function (data) {
        return _.filter(data, function (o) {
            const role = _.toLower(_.trim(_.head(o)));
            return !_.includes(EXCLUDE_ROLES, role);
        });
    }).on('data', function (row) {
        if (_.size(row) > 0) {
            row = _.map(row, o => {
                let _tmp = _.map(o, i => {
                    i = _.split(i, commaRegex);
                    return _.map(i, j => _.trim(j));
                });

                if (_.size(_tmp[0]) === 1 && _.size(_tmp[1]) > 1) {
                    _tmp[0] = _.fill(Array(_.size(_tmp[1])), _.head(_tmp[0]));
                }

                _tmp = _.zipWith(_tmp[0], _tmp[1], _tmp[2], function (role, eng, chi) {
                    return [role, eng, chi];
                });
                return _tmp;
            });

            output = _.concat(output, row);
        }
    }).on('end', function () {
        exportResult(_.flatten(output));
    });

    // READER STREAM
    const readerStream = fs.createReadStream(inputFilePath);
    readerStream
        .pipe(parser)
        .pipe(extractString)
        .pipe(filterRoles);
    // .pipe(fs.createWriteStream(outputFilePath));
}