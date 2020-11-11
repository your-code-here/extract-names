/***********************\
 *      IMPORT
 \***********************/

const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const transform = require('stream-transform')
const stringify = require('csv-stringify')

const _ = require('lodash')

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
        on_record: (record) => _.pick(record, fileObj.cols)
    });


        // .pipe(fs.createWriteStream(outputFilePath));

    const exportResult = function(result){
        result = _.filter(result, function(o) {
            return (o[1] && _.trim(o[1]) !== '') || (o[2] && _.trim(o[2]) !== '');
        });

        console.log(result);
        // result = _.map(result, o => {
        //    return _.map(o, i => _.trim(i));
        // });

        // STRINGIFIER
        const stringifier = stringify(result, {
            header: true,
            columns: {
                role: 'Role',
                eng: 'Eng',
                chi: 'Chi'
            }
        }, function(err, output){
            if (err) throw err;
            fs.writeFile(outputFilePath, output, (err) => {
                if (err) throw err;
                console.log(`${outputFilePath} saved.`);
            });
        });
    }

    // parser.on('data', function (row) {
        // console.log(row);
        // for (const col of fileObj.cols) {
        //     let parts = _.split(row[col], ';'); // Tách bởi dấu ;
        //     parts = _.compact(parts); // Loại bỏ các giá trị false, 0, '' ...
        //     parts = _.map(parts, part => {
        //         let [key, val] = _.split(part, /[：:︰﹕]/, 2);
        //         key = _.trim(_.toLower(key));
        //         val = _.replace(val, /\n/g, " "); // Remove line-break
        //         // val = split(val, ',').map(o => trim(o));
        //         return [key, val];
        //     }); // Tách [role,[names]]
        //     parts = _.filter(parts, part => !EXCLUDE_ROLES.includes(part[0])); // Loại bỏ các roles không hợp lệ
        //     parts = _.map(parts, part => part[1]); // Chỉ lấy phần name, bỏ phần role
        //     parts = _.flattenDeep(parts); // Làm phẳng array
        //     output = _.concat(output, parts); // Merge vào output
        // }
    // });
    //
    // parser.on('end', async function () {
    //     output = _.compact(output); // Loại bỏ các giá trị trống
    //     output = _.filter(output, o => !EXCLUDE_NAMES.includes(o)); // Loại bỏ các tên không hợp lệ
    //     output = _.uniq(output); // Loại bỏ các giá trị trùng lặp
    //     output = _.uniq(output); // Loại bỏ các giá trị trùng lặp
    //     console.log(`${fileObj.fileName} result: %d`, output.length);
    //     for (let i = 0; i < output.length; i++) {
    //         stringifier.write([_.trim(output[i])]);
    //     }
    //     stringifier.end();
    // });

    const commaRegex = /[,、,]/i;

    // EXTRACT DATA FROM STRING
    const extractString = transform(function(data){
        data = _.mapValues(data, function(o) {
            let parts = _.split(o, ';'); // Split by ;
            parts = _.compact(parts); // Remove false, 0, '' ...
            parts = _.map(parts, p => _.split(p, /[：:︰﹕]/, 2));
            return parts;
        });

        const eng = data[fileObj.cols[0]];
        const chi = data[fileObj.cols[1]];

        const output = [];

        for(let i = 0; i < _.size(eng); i++){
            output.push(_.concat(eng[i],_.tail(chi[i])));
        }
        // console.log(output);
        return output;
    });

    // FILTER ROLES

    const filterRoles = transform(function(data){
        data = _.filter(data, function(o) {
            return !_.includes(EXCLUDE_ROLES, _.toLower(_.trim(_.head(o))));
        });
        // console.log(data);
        return data;
    }).on('data', function(row){
        if(_.size(row) > 0){

            row = _.map(row, o => {
                let _tmp = _.map(o, i => {
                    i = _.split(i, commaRegex);
                    return _.map(i, j => _.trim(j));
                });

                if(_.size(_tmp[0]) === 1 &&  _.size(_tmp[1]) > 1){
                    _tmp[0] = _.fill(Array(_.size(_tmp[1])), _.head(_tmp[0]));
                }

                _tmp = _.zipWith(_tmp[0], _tmp[1], _tmp[2], function(role, eng, chi) {
                    return [role, eng, chi];
                });
                return _tmp;
            });
            output = _.concat(output, row);
        }
    }).on('end', function() {
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