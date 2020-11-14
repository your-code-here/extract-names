const _ = require('lodash');

module.exports = function filterByName(excludeNames){
    // console.log(excludeNames);
    this.setExcludeNames = excludeNames;
    this.apply = function(data){
        return _.reject(data, o => {
            // o = ['abc','xyz']
            return _.some(this.setExcludeNames, reg => {
                return reg.test(o[0]) || reg.test(o[1]);
            });
        });
    }
}