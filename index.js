module.exports = (function() {

    var each = require('foreach');
    var jsonEscape = require('json-escape');

    // return JSON representation of node
    /* each entity can have following properties:
     *  - tag - if it's element or doctype node (it's always string, for element nodes it's value of tagName, for doctype - name)
     *  - children - if it's element or document node (it's always array of entities or it's undefined if node has no children)
     *  - data - if it's text, comment or doctype node (string in the first two cases, array [ publicId, systemId ] in the last)
     *
     * Every entity has type property corresponding nodeType property value by default. You can disable including that information
     * by passing truthy value as the third argument
     */

    /* filters can be used to prevent including some nodes or attributes in rip
     *  - node - is called for each node, have to return falsy value if node should be omitted or some node to process (ex. the original one)
     *  - attr - is called for each attribute for each node, have to return falsy value if attribute should be omitted
     *           or some other value (ex. the original attr) or new object with fields name and value
     */

 var typeKey = 'type';
 var attrsKey = 'attrs';
 var childrenKey = 'children';
 var tagKey = 'tag';
 var dataKey = 'data';

    function serialize(node, filters, omitType) {
        if(!filters || !filters.node || (node = filters.node(node))) {
            var res = '{';

            if(!omitType) {
                res += '"' + typeKey + '":' + node.nodeType;
            }

            switch(node.nodeType) {
                case node.ELEMENT_NODE:
                case node.DOCUMENT_NODE:
                    var i, maxi;
                    var children = false;
                    var firstChild = true;
                    for(i = 0, maxi = node.childNodes.length; i < maxi; i++) {
                        var child = serialize(node.childNodes[i], filters, omitType);

                        if(child) {
                            if(!children) {
                                res += ',"' + childrenKey + '":[';

                                children = true;
                            }

                            if(!firstChild) {
                                res += ',';
                            } else {
                                firstChild = false;
                            }

                            res += child;
                        }
                    }

                    if(children) {
                        res += ']';
                    }

                    if(node.nodeType === node.ELEMENT_NODE) {
                        res += ',"' + tagKey + '":"' + jsonEscape(node.tagName) + '"';

                        var attrs = false;
                        var firstAttr = true;
                        for(i = 0, maxi = node.attributes.length; i < maxi; i++) {
                            var attr = node.attributes[i];

                            if(filters && filters.attr) {
                                attr = filters.attr(attr, node);
                            }

                            if(attr) {
                                if(!attrs) {
                                    res += ',"' + attrsKey + '":{';

                                    attrs = true;
                                }

                                if(!firstAttr) {
                                    res += ',';
                                } else {
                                    firstAttr = false;
                                }

                                res += '"' + jsonEscape(attr.name) + '":"' + jsonEscape(attr.value) + '"';
                            }
                        }

                        if(attrs) {
                            res += '}';
                        }
                    }
                break;
                case node.TEXT_NODE:
                case node.COMMENT_NODE:
                    res += ',"' + dataKey + '":"' + jsonEscape(node.data) + '"';
                break;
                case node.DOCUMENT_TYPE:
                    res += ',"' + tagKey + '":"' + jsonEscape(node.name) + '"';
                    res += ',"' + dataKey + '":["' + jsonEscape(node.publicId) + '","' + jsonEscape(node.systemId) + '"]';
                break;
                default:
            }

            res += '}';

            return res;
        }
    }


    function deserialize(token) {
        var node;

        if(token.tag) {
            if(!token.type || (token.type === document.ELEMENT_NODE)) {
                node = document.createElement(token.tag);
            } else if(token.type === document.DOCUMENT_TYPE) {
                node = document.implementation.createDocumentType(token.tag, token.data[0], token.data[1]);
            }
        } else if(token.data) {
            if(!token.type || (token.type === document.TEXT_NODE)) {
                node = document.createTextNode(token.data);
            } else if(token.type === document.COMMENT_TYPE) {
                node = document.createComment(token.data);
            }
        }

        if(node && token.attrs) {
            each(token.attrs, function(attrValue, attrName) {
                node.setAttribute(attrName, attrValue);
            });
        }

        if(node && token.children) {
            token.children.forEach(function(childToken) {
                var child = deserialize(childToken);

                if(child) {
                    node.appendChild(child);
                }
            });
        }

        return node;
    }


    return {
        serialize: serialize,
        deserialize: deserialize
    };

})();