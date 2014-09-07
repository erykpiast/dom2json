var dom2json = (function() {

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

    function rip(node, filters, omitType) {
        if(!filters.node || (node = filters.node(node))) {
            var res = '{';

            if(!omitType) {
                res += '"type":' + node.nodeType;
            }

            switch(node.nodeType) {
                case node.ELEMENT_NODE:
                case node.DOCUMENT_NODE:
                    var children = false;
                    var firstChild = true;
                    for(var i = 0, maxi = node.childNodes.length; i < maxi; i++) {
                        var child = rip(node.childNodes[i], filters, omitType);

                        if(child) {
                            if(!children) {
                                res += ',"children":[';

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
                        res += ',"tag":"' + json_escape(node.tagName) + '"';

                        var attrs = false;
                        var firstAttr = true;
                        for(var i = 0, maxi = node.attributes.length; i < maxi; i++) {
                            var attr = node.attributes[i];
                            var value = attr.value;

                            if(filters.attr) {
                                attr = filters.attr(attr, node);
                            }

                            if(attr) {
                                if(!attrs) {
                                    res += ',"attrs":{';

                                    attrs = true;
                                }

                                if(!firstAttr) {
                                    res += ',';
                                } else {
                                    firstAttr = false;
                                }

                                res += '"' + json_escape(attr.name) + '":"' + json_escape(attr.value) + '"';
                            }
                        }

                        if(attrs) {
                            res += '}';
                        }
                    }
                break;
                case node.TEXT_NODE:
                case node.COMMENT_NODE:
                    res += ',"data":"' + json_escape(node.data) + '"';
                break;
                case node.DOCUMENT_TYPE:
                    res += ',"tag":"' + json_escape(node.name) + '"';
                    res += ',"data":["' + json_escape(node.publicId) + '","' + json_escape(node.systemId) + '"]';
                break;
                default:
            }

            res += '}';

            return res;
        }
    }


    function each(obj, iter, context) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                iter.call(context || null, obj[key], key, obj);
            }
        }
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };

    function json_escape(string) {
        escapable.lastIndex = 0;

        return escapable.test(string) ? string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) : string.toString();
    }

    function restructure(token) {
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
                var child = restructure(childToken);

                if(child) {
                    node.appendChild(child);
                }
            });
        }

        return node;
    }


    return rip;

})();