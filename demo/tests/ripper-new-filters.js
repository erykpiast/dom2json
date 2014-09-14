module.exports = (function() {
    var tagsToRemove = [ 'META', 'LINK', 'SCRIPT', 'NOSCRIPT' ];
    var tagsAllowedInHead = [ 'META', 'LINK' ];
    
    var isDescendant = function(node, ancestor) {
        while(node && (node !== node.ownerDocument)) {
            node = node.parentNode;
            
            if(node === ancestor) {
                return true;
            }
        }
        
        return false;
    };
    
    var nodesFilter = function(node) {
        if(node.nodeType === node.ELEMENT_NODE) {
            var tag = node.tagName;
            
            if(tagsToRemove.indexOf(tag) !== -1) {
                if(tag === 'META') {
                    if(node.getAttribute('name') === 'viewport') {
                        return node;
                    }
                } else if(tag === 'LINK') {
                    if(node.getAttribute('rel') === 'stylesheet') {
                        return node;
                    }  
                }
                
                return null;
            } else if(isDescendant(node, document.head) && (tagsAllowedInHead.indexOf(tag) === -1)) {
                return null;
            } else if(([ 'BODY', 'HEAD' ].indexOf(tag) === -1) && (node.parentNode === document.documentElement)) {
                return null;
            } else {
                return node;
            }
        } else if(node.nodeType === node.TEXT_NODE) {
            return node;
        } else {
            return null;
        }
    };
    
    var attrsFilter = function(attr, node) {
        var tag = node.tagName;
        var name = attr.name;
        
        if((tag === 'BASE') && (name === 'href')) {
            return {
                name: name,
                value: window.location.origin + attr.value
            };
        } else if(tag === 'IFRAME' && (name === 'src')) {
            return null;
        }
    };
    
    
    return {
        node: nodesFilter,
        attr: attrsFilter
    };
    
})();