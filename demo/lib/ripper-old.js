module.exports = (function() {
 
    function serialize(node, preprocess) {
        return {
            html: _mirror(node, preprocess),
            attrs: _getAttrs(node),
            name: node.nodeName
        };
    }
 
 
    function _mirror(node, preprocess) {
        var tmpdom = node.cloneNode(true);
 
        preprocess(tmpdom);
 
        return tmpdom.innerHTML;
    }
 
 
    function _getAttrs(node) {
        var ret = [];
 
        for (var i = 0, maxi = node.attributes.length; i < maxi; i++) {
            ret[i] = {
                name: node.attributes[i].name,
                value: node.attributes[i].value
            };
        }
 
        return ret;
    }
 
 
    return {
        serialize: serialize
    };
 
})();