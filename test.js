dom2json(document.documentElement, {
    node: function(node) {
        if(node.tagName === 'SPAN') {
            return;
        } else {
            return node;
        }
    },
    attr: function(attr) {
        if(attr.name === 'style') {
            return false;
        } else {
            return attr;
        }
    }
});