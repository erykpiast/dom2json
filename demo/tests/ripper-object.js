module.exports = (function() {
    var ripperNewObject = require('../lib/ripper-object');
    var ripperNewFilters = require('./ripper-new-filters');
   
    return function() {
        JSON.stringify(ripperNewObject.serialize(document.documentElement, ripperNewFilters));
    };
    
})();