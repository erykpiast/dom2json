module.exports = (function() {

    var ripperOld = require('../lib/ripper-old');
    
    
    var toArray = function(thing) {
        return Array.prototype.slice.call(thing);
    };
    
    var domProcessor = function(dom) {
        var head = dom.getElementsByTagName('head')[0] || dom.querySelector('head');
        var body = dom.getElementsByTagName('body')[0] || dom.querySelector('body');
        var toRemove, i, maxi;
    
        /* --- add or replace base tag --- */
        var base = dom.getElementsByTagName('base');
        if (base.length) {
            for (i = 0, maxi = base.length; i < maxi; i++) {
                base[i].setAttribute('href', window.location.origin + base[i].getAttribute('href'));
            }
        } else {
            base = document.createElement('base');
            base.setAttribute('href', window.location.origin + window.location.pathname);
            if(head.firstChild) {
                head.insertBefore(base, head.firstChild);
            } else {
                head.appendChild(base);
            }
        }
    
        /* --- HEAD --- */
    
    
    
        if (head) {
            toRemove = toArray(dom.querySelectorAll([
                'head meta:not([name~=viewport]):not([charset])',
                'head link:not([rel~=stylesheet])',
                'head :not(meta):not(link)'
            ].join(',')));
    
            i = toRemove.length;
    
            while (i--) {
                toRemove[i].parentNode.removeChild(toRemove[i]);
            }
        }
    
    
        /* --- BODY --- */
    
        /* remove src of iframes (leave nodes in DOM!) */
        toRemove = dom.getElementsByTagName('iframe');
    
        i = toRemove.length;
    
        while (i--) {
            toRemove[i].removeAttribute('src');
        }
    
    
        /* --- other --- */
        if (head) {
            /* remove all nodes outside HEAD and BODY */
            while (head.previousElementSibling) { // before head
                head.parentNode.removeChild(head.previousElementSibling);
            }
        }
        if (body) {
            while (body.previousElementSibling && (body.previousElementSibling !== head /*yeah, that's right. if no head, this comparison is just redundant*/)) {
                body.parentNode.removeChild(body.previousElementSibling);
            }
            while (body.nextElementSibling) { // after body
                body.parentNode.removeChild(body.nextElementSibling);
            }
        }
    
        return dom;
    };
    
    
    return function() {
        JSON.stringify(ripperOld.serialize(document.documentElement, domProcessor));
    };
})();