var Benchmark = require('benchmark');
var ripperOldTest = require('./tests/ripper-old');
var ripperNewObjectTest = require('./tests/ripper-object');
var ripperNewStringTest = require('./tests/ripper-string');

// run without measure to minimalize influence of any initialization
ripperOldTest();
ripperNewObjectTest();
ripperNewStringTest();


var cycles = [ ];
var suite = new Benchmark.Suite()
    .add('Ripper old', ripperOldTest)
    .add('Ripper new object', ripperNewObjectTest)
    .add('Ripper new string', ripperNewStringTest)
    .on('cycle', function(event) {
        cycles.push(event.target);
    })
    .on('complete', function() {
        document.body.innerHTML = [
            '<h1>Benchmark results</h1>'
        ].concat(
            [ '<ol>' ],
            cycles.map(function(cycle) {
                return String(cycle);
            }).map(function(cycle) {
                return ('<li>' + cycle + '</li>')
            }),
            [ '</ol>' ],
            [
                '<p>And the winner is...<br/>',
                '<strong>' + this.filter('fastest').pluck('name')[0].toUpperCase() + '</strong>!'
            ]
        ).join('');
    });

setTimeout(function() {
    suite.run();
}, 2000);