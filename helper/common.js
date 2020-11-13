/***********************\
          IMPORT
\***********************/

const _ = require('lodash')

/***********************\
        DECLARE
\***********************/

const commaRegex = /[,、,;\n]/gi

function isEmpty(value) {
    if (!value) return true;
    value = _.trim(value);
    return ['', '-', 'nil', '.', '/', 'n.a.'].includes(value);
}

function isEqual(str1, str2) {
    str1 = _.trim(_.toLower(str1));
    str2 = _.trim(_.toLower(str2));
    return str1 === str2;
}

function splitByComma(str){
    return _.split(str, commaRegex);
}

function clearRole(str){
    return _.trim(_.replace(str, /^.+[：:︰﹕]/, ''));
}

/***********************\
          EXPORT
\***********************/
module.exports = {
    commaRegex,
    isEmpty,
    isEqual,
    splitByComma,
    clearRole
}