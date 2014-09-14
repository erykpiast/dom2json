dom2json
========

Simple utility for serializing page Document Object Model to JSON.

### Usage ###

Serializing whole document.

```
    var dom2json = require('dom2json');
    
    var json = dom2json.serialize(document.documentElement);
```

Using filters to not include scripts and iframes' sources in JSON.
```
    var dom2json = require('dom2json');
    
    var json = dom2json.serialize(document.documentElement, {
        node: function(node) {
            if(node.tagName === 'SCRIPT') {
                return null;
            } else {
                return node;
            }
        },
        attr: function(attr, node) {
            if((attr.name === 'src') && (node.tagName === 'IFRAME')) {
                return null;
            } else {
                return attr;
            }
        }
    });
```

### Performance ###
For performance look at [results for different websites](https://docs.google.com/spreadsheets/d/19x-_F-TkrRBz9f8y5HsW2r0fF8lRam8W5om7NTtWZDY/pubhtml).