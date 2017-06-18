var express = require('express');
var router = express.Router();
var request = require('request')
    ,   cachedRequest = require('cached-request')(request)
    ,   cacheDirectory = "./tmp/cache";
cachedRequest.setValue('ttl', 60000);
cachedRequest.setCacheDirectory(cacheDirectory);
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function (req, res, next) {
    var deps1 = null;
    var deps2 = null;
    var deps3 = null;

    var s1 = "9120008";
    var s2 = "9161512";
    var s3 = "9120003";

    getDeps(s1, 4, function (deps) {
        deps1 = deps;
        complete();
    });
    getDeps(s2, 4, function (deps) {
        deps2 = deps;
        complete();
    });
    getDeps(s3, 4, function (deps) {
        deps3 = deps;
        complete();
    });

    function complete() {
        if (deps1 !== null && deps2 !== null && deps3 !== null) {
            console.log(deps1.length,deps2.length,deps3.length);
            var data = {
                deps1: deps1,
                deps2: deps2,
                deps3: deps3,
                names: {
                    s1: s1,
                    s2: s2,
                    s3: s3
                }};
            res.render('new', data)
        }
    }
})

var getDeps = function(id, n, callback) {
    cachedRequest({url: 'http://mobil.bvg.de/Fahrinfo/bin/stboard.bin/dox?&input='+id+'&boardType=depRT&start=yes&maxJourneys=25'}, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
        $ = cheerio.load(body);
        var deps = [];
        $("tbody tr").each(function (i, element) {
            //text += $(this).text() + "<br>";
            if (i<n){
                var dep = {};
                dep.time = $('td', this).eq(0).text().replace(/\n/g, "").replace(/\*/g, "").replace(/ /g, "");
                var line = $('td', this).eq(1).text().replace(/\n/g, "");
                if (line.indexOf('S') !== -1) dep.type = 'S-Bahn';
                else if (line.indexOf('U') !== -1) dep.type = 'U-Bahn';
                else if (line.indexOf('RB') !== -1) dep.type = 'RB';
                else if (line.indexOf('Tra') !== -1) dep.type = 'Tram';
                else dep.type = 'Bus';
                dep.line = line.replace('Bus', '');
                dep.dest = $('td', this).eq(2).text().replace(/\n/g, "");
                deps.push(dep);
            }
        });
        //text = text.replace(/\*/g, "");
        //res.send(text);
        //res.send(JSON.stringify(deps));
        callback(deps);
    });
}

router.get('/:id/:n?', function(req, res, next) {
    var id = req.params.id;
    var n = 10;
    if (req.params.n){
        n = req.params.n;
    }
    getDeps(id, n, function (deps) {
        res.send(deps);
    });
});

module.exports = router;
