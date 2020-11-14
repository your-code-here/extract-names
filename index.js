/***********************\
 *      IMPORT
 \***********************/
const fs = require('fs')
const path = require('path')
const parse = require('csv-parse')
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
const EXCLUDE_ROLES = _.map(['^.$', 'Presenter', 'Performing Group'], o => new RegExp(o,'ig'));
const EXCLUDE_NAMES = _.map([
    '小學', '中學', '團', '社', '制作', '公司', '設計', '舞蹈', '協會', '協進會', '班',
    'centre', 'ltd', 'limited', 'group', 'production', 'makeup', 'school', 'college', 'ccdc',
    'Op\\.', 'No\\.'
], o => new RegExp(o,'ig'));

const musicFile = {
    fileName: "music.csv",
    cols: [ 'Presenter_Eng', 'Presenter_Chi', 'Work_Eng', 'Work_Chi' ],
}
const danceFile = {
    fileName: "dance.csv",
    cols: [ '演出/製作', 'Cast and Production', '藝術總監', 'Name of Artistic Director', '編舞', 'Choreographers' ],
}
const dramaFile = {fileName: "drama.csv"}
const theatreFile = {fileName: "theatre.csv"}
const xiquFile = {fileName: "xiqu.csv"}
const va1013File = {
    fileName: "1013VA.csv",
    cols: [ 'participant_en', 'participant_tc' ],
}
const va1318File = {
    fileName: "1318VA.csv",
    cols: [ 'participant_en', 'participant_tc' ],
}
/***********************\
 *      MAIN APP
 \***********************/


const parser = parse({
    bom: true,
    relax: true,
    columns: true,
    delimiter: ',',
    ltrim: true,
    rtrim: true,
    on_record: record => {
        return new RegExp(_.get(record, 'title'), 'gi');
    }
}).on('data', data => {
    EXCLUDE_NAMES.push(data);
}).on('end', async () => {
    const options = {
        DATASET_DIR_NAME,
        OUTPUT_DIR_NAME,
        EXCLUDE_ROLES,
        EXCLUDE_NAMES
    };

    await processMusic(musicFile, options);
    await processDance(danceFile,options);
    await processEvent(dramaFile, options)
    await processEvent(theatreFile, options)
    await processEvent(xiquFile, options)
    await processVa(va1013File, options)
    await processVa(va1318File, options)
});

// READER STREAM
const inputFilePath = path.resolve(DATASET_DIR_NAME, 'organization_names.csv');
fs.createReadStream(inputFilePath).pipe(parser);

