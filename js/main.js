'use strict';

// Full list of configuration options available at:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
    controls: true,
    progress: true,
    history: true,
    center: false,

    transition: 'slide', // none/fade/slide/convex/concave/zoom

    dependencies: [
        { src: 'bower_components/reveal.js/lib/js/classList.js', condition: function () { return !document.body.classList; } },
        { src: 'bower_components/reveal.js/plugin/markdown/marked.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'bower_components/reveal.js/plugin/markdown/markdown.js', condition: function () { return !!document.querySelector('[data-markdown]'); } },
        { src: 'bower_components/reveal.js/plugin/highlight/highlight.js', async: true, condition: function () { return !!document.querySelector('[data-html]') || !!document.querySelector('pre code') || !!document.querySelector('[data-markdown]'); }, callback: function () { hljs.initHighlightingOnLoad(); } },
        { src: 'bower_components/reveal.js/plugin/zoom-js/zoom.js', async: true },
        { src: 'bower_components/reveal.js/plugin/notes/notes.js', async: true },
        { src: 'js/loadhtmlslides.js', condition: function () { return !!document.querySelector('[data-html]'); } }
    ]

});

Reveal.addEventListener('slidechanged', (event) => {

    if($(event.previousSlide).attr('id') === 'treeslide') {
        tree.destroy();
    };   

    // Make iframes interactive
    if ($(event.currentSlide).attr('data-background-iframe')) {
        $('.reveal > .backgrounds').css('z-index', 1);
    } else {
        $('.reveal > .backgrounds').css('z-index', 0);
    };
});

Reveal.addEventListener('ready', (event) => {

    /**
     * Tree slide
     */
    Reveal.addEventListener('branchtree', function() {
        tree.init();
    });
    
    /**
     * Search Demo
     */
    Reveal.addEventListener('search', () => {
        const appId = '3c6bd21f-7447-41ed-94af-535c22682aeb';
        const config = {
            host: 'localhost',
            isSecure: true,
            appname: appId
        };
        
        qsocks.ConnectOpenApp(config)
        .then((conn) => {
            const app = conn[1];
            senseSearch.connectWithQSocks(app);
            
            const slide = document.querySelector('[data-state=search]');
            const searchinput = new SenseSearchInput("searchinput");
            const searchresults = new SenseSearchResult("searchresults");
            
            slide.appendChild(searchinput.element).appendChild(searchresults.element);

            const resultOptions = {
                "fields":[{
                    "dimension": "FullName",
                    "suppressNull": true
                },{
                    "dimension": "Trigram",
                    "suppressNull": false
                },{
                    "dimension": "Office",
                    "suppressNull": false
                },{
                    "dimension": "Country",
                    "supressNull": false
                }],
                "sortOptions": {
                    "FullName": {
                        "name": "A-Z",
                        "order": 1,
                        "field": "FullName",
                        "sortType": "qSortByExpression",
                        "sortExpression" : {
                            "qv": "HasImage=1"
                        }
                    }
                },
                "defaultSort": "FullName",
                "pageSize": 700
            };
            
            const inputOptions = {
                "searchFields": ["FullName","Office","Tree","Country"],
                "suggestFields": ["FullName","Office","Tree","Country"]
            };        
            searchresults.object.enableHighlighting = false;
            searchresults.object.renderItems = function(data) {
                var html = data.map((d) => {
                    if (data.length < 30) {
                        return '<img class="search-image plain big" src="Photos/' + d.Trigram.value + '.jpg" onError="this.onerror=null;this.src=\'resources/placeholder.png\';"/>'
                    }
                    return '<img class="search-image plain" src="Photos/' + d.Trigram.value + '.jpg" onError="this.onerror=null;this.src=\'resources/placeholder.png\';"/>'
                }).join('\n')
                document.getElementById(this.resultsElement).innerHTML = html;
            };
            
            app.clearAll().then(() => {
               
                searchinput.object.attach(inputOptions);
                searchresults.object.attach(resultOptions, function() {
                    searchresults.object.getNextBatch()
                });              
            })
            
        });
    })
    
    /**
     * syntax demo
     */
    Reveal.addEventListener('syntaxdemo', () => {
        
        var connect;
        var res = $('#syntaxresponse');

        $('#syntaxdemoconnect').click(function() {
            $('#syntaxdemoconnect').text('Disconnect')
            connect = new WebSocket('ws://localhost:4848/app/engineData');
            connect.onmessage = function(msg) {
                res.text( JSON.stringify(JSON.parse(msg.data), null, 2) + res.text() )
            }
            
            $('#syntaxdemosend').click(() => {
                connect.send($('#syntaxrequest').text())
            });
            
        });        
    });
    
    
    /**
     * qsocks demo
     */
    Reveal.addEventListener('createappsdemo', () => {
        
        $('#createappexecute').click(() => {
            $('#progressareacreateapps .progressspinner').show();
            createApp();
        });
        
        function createApp() {
            const appname = 'Qonnections Demo' + Date.now()
            qsocks.Connect()
            .then( (global) => global.createDocEx(appname) )
            .then((app) => {

                const loadscript =
                    `Load RecNo() as Dim, Rand() * 100 as Value
                        Autogenerate 100;`

                return app.setScript(loadscript)
                    .then(() => app.doReload())
                    .then(() => app.doSave())

            })
            .then(() => {
                $('#progressareacreateapps .progressspinner').fadeOut(function() {
                    $('#progressareacreateapps')
                    .append('<a href="http://localhost:4848/sense/app/' + encodeURI(appname) + '" target="_blank">Open App</a>')
                });
            })
            .catch((err) => console.log);
        };
        
    });

});