module.exports = (function() {
    var ripperNewString = require('../../index');
    var ripperNewFilters = require('./ripper-new-filters');
   
    return function() {
        ripperNewString.serialize(document.documentElement, ripperNewFilters);
    };
    
})();