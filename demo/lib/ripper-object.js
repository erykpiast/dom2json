module.exports = (function() {
    
    var typeKey = 'type';
    var attrsKey = 'attrs';
    var childrenKey = 'children';
    var tagKey = 'tag';
    var dataKey = 'data';
 
    function serialize(node, filters, omitType) {
        if(!filters.node || (node = filters.node(node))) {
            var res = { };
 
            if(!omitType) {
                res[typeKey] = node.nodeType;
            }
 
            switch(node.nodeType) {
                case node.ELEMENT_NODE:
                case node.DOCUMENT_NODE:
                    for(var i = 0, maxi = node.childNodes.length; i < maxi; i++) {
                        var child = serialize(node.childNodes[i], filters, omitType);
 
                        if(child) {
                            if(!res[childrenKey]) {
                                res[childrenKey] = [ ];
                            }
 
                            res[childrenKey].push(child);
                        }
                    }
 
                    if(node.nodeType === node.ELEMENT_NODE) {
                        res[tagKey] = node.tagName;
 
                        for(var i = 0, maxi = node.attributes.length; i < maxi; i++) {
                            var attr = node.attributes[i];
 
                            if(filters.attr) {
                                attr = filters.attr(attr, node);
                            }
 
                            if(attr) {
                                if(!res[attrsKey]) {
                                    res[attrsKey] = { };
                                }
 
                                res[attrsKey][attr.name] = attr.value;
                            }
                        }
                    }
                break;
                case node.TEXT_NODE:
                case node.COMMENT_NODE:
                    res[dataKey] = node.data;
                break;
                case node.DOCUMENT_TYPE:
                    res[tagKey] = node.name;
                    res[dataKey] = [ node.publicId, node.systemId ];
                break;
                default:
              }
 
            return res;
        }
    }
 
 
    return {
        serialize: serialize
    };
 
})();