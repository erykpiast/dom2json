/* global jasmine, describe, it, expect, beforeEach, afterEach */
var $ = require('jquery');
var lodash = require('lodash');
var diff = require('deep-diff').diff;

var proxyquire = require('proxyquireify')(require);

var dom2json = proxyquire('../index.js', {});


function _flatten(childrenKey) {
    return function flatten(tree) {
        var children = tree[childrenKey];
        var clone = lodash.extend({ }, tree);
        delete clone.children;

        var flat = [ clone ];
        if(children) {
            for(var i = 0, maxi = children.length; i < maxi; i++) {
                flat = flat.concat(flatten(children[i]));
            }
        }

        return flat;
    };
}


function _treeDepth(childrenKey) {
    return function getDepth(tree) {
        if (!tree[childrenKey]) {
            return 0;
        } else {
            var max = -1;
            for(var i = 0, maxi = tree[childrenKey].length; i < maxi; i++) {
                var depth = getDepth(tree[childrenKey][i]);

                if (depth > max) {
                    max = depth;
                }
            }

            return max + 1;
        }
    };
}


describe('dom2json module test', function() {

    it('Should be an object with two public methods', function() {
        expect(typeof dom2json).toBe('object');
        expect(typeof dom2json.serialize).toBe('function');
        expect(typeof dom2json.deserialize).toBe('function');
    });

});


describe('dom2json serialize method test', function() {
    var dom;

    beforeEach(function() {
        dom = $('<div id="tree-root">' +
            '<ul class="ul ul1" ' +
                'style="list-style-type: none; background-image: url(\'assets/example.png\');">' +
                '<li class="li1" id="li1">' +
                    'li<br/>' +
                    '<span style="text-decoration: underline" data-something="{ &quot;something&quot;: &quot;something&quot; }">' +
                        '1' +
                    '</span>' +
                '</li>' +
                '<li class="li1" id="li2">' +
                    'li<br/>' +
                    '<span style="text-decoration: underline" data-something="something2">' +
                        '1' +
                    '</span>' +
                '</li>' +
                '<li data-something="{ \\"something\\": \\"something\\" }"></li>' +
            '</ul>' +
        '</div>')[0];
    });

    afterEach(function() {
        dom = null;
    });


    it('Should return a valid JSON', function() {
        var json = dom2json.serialize(dom);

        expect(function() {
            JSON.parse(json);
        }).not.toThrow();
    });

    it('Should return as deep JSON tree as DOM tree was', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(_treeDepth('children')(json)).toEqual(_treeDepth('childNodes')(dom));
    });

    it('Should return JSON tree with as many nodes as in DOM tree', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(_flatten('children')(json).length).toEqual(_flatten('childNodes')(dom).length);
    });

    it('Should preserve child-parent relation', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(json.children).toBeDefined();
        expect(json.children.length).toBe(1);

        expect(json.children[0].children).toBeDefined();
        expect(json.children[0].children.length).toBe(3);

        expect(json.children[0].children[0].children).toBeDefined();
        expect(json.children[0].children[0].children.length).toBe(3);

        expect(json.children[0].children[0].children[2].children).toBeDefined();
        expect(json.children[0].children[0].children[2].children.length).toBe(1);
    });

    it('Should preserve attributes', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(json.attrs).toBeDefined();
        expect(json.attrs.id).toBeDefined();

        expect(json.children[0].attrs).toBeDefined();
        expect(json.children[0].attrs.class).toBeDefined();
        expect(json.children[0].attrs.style).toBeDefined();

        expect(json.children[0].children[0].attrs).toBeDefined();
        expect(json.children[0].children[0].attrs.class).toBeDefined();

        expect(json.children[0].children[0].children[2].attrs).toBeDefined();
        expect(json.children[0].children[0].children[2].attrs.style).toBeDefined();
        expect(json.children[0].children[0].children[2].attrs['data-something']).toBeDefined();
    });

    it('Should properly escape JSON characters in attr values', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(
            json.children[0].attrs.style
        ).toEqual('list-style-type: none; background-image: url(\'assets/example.png\');');

        expect(
            json.children[0].children[0].children[2].attrs['data-something']
        ).toEqual('{ "something": "something" }');
    });

    it('Should properly escape JSON characters in attr names', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        expect(json.children[0].children[2].attrs['data-something']).toBeDefined();
        expect(json.children[0].children[2].attrs['something\\":']).toBeDefined();
        expect(json.children[0].children[2].attrs['\\"something\\"']).toBeDefined();
        expect(json.children[0].children[2].attrs['}"']).toBeDefined();
    });

    it('Should create JSON representation of DOM', function() {
        var json = JSON.parse(dom2json.serialize(dom));

        var expected = {
            type: 1,
            tag: 'DIV',
            attrs: {
                id: 'tree-root'
            },
            children: [{
                type: 1,
                tag: 'UL',
                attrs: {
                    'class': 'ul ul1',
                    style: 'list-style-type: none; background-image: url(\'assets/example.png\');'
                },
                children: [{
                    type: 1,
                    tag: 'LI',
                    attrs: {
                        'class': 'li1',
                        id: 'li1'
                    },
                    children: [{
                        type: 3,
                        data: 'li'
                    }, {
                        type: 1,
                        tag: 'BR'
                    }, {
                        type: 1,
                        tag: 'SPAN',
                        attrs: {
                            style: 'text-decoration: underline',
                            'data-something': '{ "something": "something" }'
                        },
                        children: [{
                            type: 3,
                            data: '1'
                        }]
                    }]
                }, {
                    type: 1,
                    tag: 'LI',
                    attrs: {
                        'class': 'li1',
                        id: 'li2'
                    },
                    children: [{
                        type: 3,
                        data: 'li'
                    }, {
                        type: 1,
                        tag: 'BR'
                    }, {
                        type: 1,
                        tag: 'SPAN',
                        attrs: {
                            style: 'text-decoration: underline',
                            'data-something': 'something2'
                        },
                        children: [{
                            type: 3,
                            data: '1'
                        }]
                    }]
                }, {
                    type: 1,
                    tag: 'LI',
                    attrs: {
                        'data-something': '{ \\',
                        'something\\":': '',
                        '\\"something\\"': '',
                        '}"': ''
                    }
                }]
            }]
        };

        expect(lodash.isEqual(json, expected)).toBe(true);

    });

});