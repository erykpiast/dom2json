var randomDom = require('random-dom-generator');
var $ = require('jquery');
var dom2json = require('../index.js');

$(function init() {
    randomDom(document.querySelector('#random'), 2000, 10, 20, 4, [ 'div', 'span' ], {
        class: [ 'class1', 'class1 class2', 'class1 class2 class3' ],
        id: [ 'id1', 'id2', 'id3' ],
        title: [ 'title1', 'title2', 'title3' ],
        style: [ 'background-color: red', 'border-color: orange', 'outline-color: purple' ]
    });
        
    var json = dom2json.serialize(document.documentElement, {
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
    
    var dom = dom2json.deserialize(json);
});