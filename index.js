/***********************\
 *      IMPORT
\***********************/
const _ = require('lodash')
const processMusic = require('./helper/process-music')

/***********************\
 *      VARIABLES
\***********************/

const DATASET_DIR_NAME = 'datasets'
const OUTPUT_DIR_NAME = 'data-result'
const EXCLUDE_ROLES = ['.','Presenter', 'Performing Group'].map(o => _.trim(_.toLower(o)))
const EXCLUDE_NAMES = [
    '小學', '中學', '團', '社', '制作', '公司', '設計', '舞蹈', '協會', '協進會', '班',
    'centre', 'ltd', 'limited', 'group', 'production', 'makeup', 'school', 'college', 'ccdc',
    'op.','no.'
];

const musicFile = {
    fileName: "music.csv",
    cols: [
        'Presenter_Eng',
        'Presenter_Chi',
        'Work_Eng',
        'Work_Chi'
    ],
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
 *      MAIN APP
\***********************/

processMusic(musicFile, {
    DATASET_DIR_NAME,
    OUTPUT_DIR_NAME,
    EXCLUDE_ROLES,
    EXCLUDE_NAMES
});