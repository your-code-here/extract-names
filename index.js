/***********************\
 *      IMPORT
\***********************/
const _ = require('lodash')
const processMusic = require('./helper/process-music')
const processDance = require('./helper/process-dance')
const processEvent = require('./helper/process-event')

/***********************\
 *      VARIABLES
\***********************/

const DATASET_DIR_NAME = 'datasets'
const OUTPUT_DIR_NAME = 'data-result'
const EXCLUDE_ROLES = ['.', 'Presenter', 'Performing Group'].map(o => _.trim(_.toLower(o)))
const EXCLUDE_NAMES = [
    '小學', '中學', '團', '社', '制作', '公司', '設計', '舞蹈', '協會', '協進會', '班',
    'centre', 'ltd', 'limited', 'group', 'production', 'makeup', 'school', 'college', 'ccdc',
    'op.', 'no.'
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
    cols: [
        '演出/製作',
        'Cast and Production',
        '藝術總監',
        'Name of Artistic Director',
        '編舞',
        'Choreographers'
    ],
}
const dramaFile = { fileName: "drama.csv" }
const theatreFile = { fileName: "theatre.csv" }
const xiquFile = {fileName: "xiqu.csv"}

const exampleFile = {
    fileName: "example.csv",
    cols: ['Event'],
}

/***********************\
 *      MAIN APP
\***********************/

const options = {
    DATASET_DIR_NAME,
    OUTPUT_DIR_NAME,
    EXCLUDE_ROLES,
    EXCLUDE_NAMES
};

// processMusic(musicFile, {
//     DATASET_DIR_NAME,
//     OUTPUT_DIR_NAME,
//     EXCLUDE_ROLES,
//     EXCLUDE_NAMES
// });

// processDance(danceFile, {
//     DATASET_DIR_NAME,
//     OUTPUT_DIR_NAME,
//     EXCLUDE_ROLES,
//     EXCLUDE_NAMES
// });

// processEvent(dramaFile, options)
// processEvent(theatreFile, options)
processEvent(xiquFile, options)