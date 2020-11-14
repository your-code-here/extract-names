const fs = require('fs')
const stringify = require('csv-stringify')

/**
 *
 * @param {[]} result
 * @param {string[]} columns
 * @param {string} outputFilePath
 * @param {boolean} debug
 */
module.exports = function exportResult(result, columns, outputFilePath, debug = false) {
    return new Promise((resolve, reject) => {
        stringify(result, {
            header: true,
            columns
        }, function (err, output) {
            if (err) throw err;
            if (debug) {
                console.log(output);
                console.log(`${outputFilePath} saved. [Result: ${result.length}]`);
            } else {
                fs.writeFile(outputFilePath, output, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    console.log(`${outputFilePath} saved. [Result: ${result.length}]`);
                    resolve(result.length);
                });
            }
        });
    })
}