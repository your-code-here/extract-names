/***********************\
 *      IMPORT
\***********************/

const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
const stringify = require('csv-stringify')
const pick = require('lodash/pick')
const split = require('lodash/split')
const compact = require('lodash/compact')
const map = require('lodash/map')
const filter = require('lodash/filter')
const uniq = require('lodash/uniq')
const trim = require('lodash/trim')
const toLower = require('lodash/toLower')
const flattenDeep = require('lodash/flattenDeep')
const concat = require('lodash/concat')
const replace = require('lodash/replace')

/***********************\
 *      VARIABLES
\***********************/

const DATASET_DIR_NAME = 'datasets'
const OUTPUT_DIR_NAME = 'data-result'
const EXCLUDE_ROLES = ['主辦', 'Presenter', '演出團體 Performing Group'].map(o => trim(toLower(o)))
const EXCLUDE_NAMES = ['nil'];

const musicFile = {
    fileName: "music.csv",
    cols: ['Presenter_Eng', 'Presenter_Chi', 'Work_Eng', 'Work_Chi'],
}
const danceFile = {
    fileName: "dance.csv",
    cols: ['Event'],
}
const dramaFile = {
    fileName: "drama.csv",
    cols: ['Event'],
}
const theatreFile = {
    fileName: "theatre.csv",
    cols: ['Event'],
}

const xiquFile = {
    fileName: "xiqu.csv",
    cols: ['Event'],
}

const exampleFile = {
    fileName: "example.csv",
    cols: ['Event'],
}

/***********************\
 *      FUNCTIONS
\***********************/

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function process(fileObj) {
    const inputFilePath = path.resolve(DATASET_DIR_NAME, fileObj.fileName);
    const outputFilePath = path.resolve(OUTPUT_DIR_NAME, fileObj.fileName);
    const readerStream = fs.createReadStream(inputFilePath);
    readerStream.setEncoding('UTF8'); // Set the encoding to be utf8.

    let output = []

    const stringifier = stringify({
        quote: false
    });

    stringifier.pipe(fs.createWriteStream(outputFilePath))

    const parser = parse({
        bom: true,
        relax: true,
        columns: true,
        delimiter: ',',
        ltrim: true,
        rtrim: true,
        on_record: (record) => pick(record, fileObj.cols)
    });

    // Use the readable stream api
    parser
        .on('data', function (row) {
            for (const col of fileObj.cols) {
                let parts = split(row[col], ';'); // Tách bởi dấu ;
                parts = compact(parts); // Loại bỏ các giá trị false, 0, '' ...
                parts = map(parts, part => {
                    let [key, val] = split(part, /[：:︰﹕]/, 2);
                    key = trim(toLower(key));
                    val = replace(val, /\n/g, " "); // Remove line-break
                    // val = split(val, ',').map(o => trim(o));
                    return [key, val];
                }); // Tách [role,[names]]
                parts = filter(parts, part => !EXCLUDE_ROLES.includes(part[0])); // Loại bỏ các roles không hợp lệ
                parts = map(parts, part => part[1]); // Chỉ lấy phần name, bỏ phần role
                parts = flattenDeep(parts); // Làm phẳng array
                output = concat(output, parts); // Merge vào output
            }
        }).on('end', async function () {
            output = compact(output); // Loại bỏ các giá trị trống
            output = filter(output, o => !EXCLUDE_NAMES.includes(o)); // Loại bỏ các tên không hợp lệ
            output = uniq(output); // Loại bỏ các giá trị trùng lặp


            await sleep(1000);
            output = uniq(output); // Loại bỏ các giá trị trùng lặp
            await sleep(1000);
            console.log(`${fileObj.fileName} result: %d`, output.length);
            for (let i = 0; i < output.length; i++) {
                stringifier.write([trim(output[i])]);
            }
            stringifier.end();
        });

    readerStream.pipe(parser);
}

/***********************\
 *      MAIN APP
\***********************/

// process(exampleFile);
process(musicFile);