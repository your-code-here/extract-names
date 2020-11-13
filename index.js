/***********************\
 *      IMPORT
\***********************/
const _ = require('lodash')
const processMusic = require('./helper/process-music')
const processDance = require('./helper/process-dance')
const processEvent = require('./helper/process-event')
const processVa = require('./helper/process-va')

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
const va1013File = {
    fileName: "1013VA.csv",
    cols: [
        'participant_en',
        'participant_tc'
    ],
}
const va1318File = {
    fileName: "1318VA.csv",
    cols: [
        'participant_en',
        'participant_tc'
    ],
}

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

// processMusic(musicFile, options);
// processDance(danceFile,options);
// processEvent(dramaFile, options)
// processEvent(theatreFile, options)
// processEvent(xiquFile, options)
// processVa(va1013File, options)
processVa(va1318File, options)