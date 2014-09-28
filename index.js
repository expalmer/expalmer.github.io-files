var Metalsmith   = require('metalsmith');
var markdown     = require('metalsmith-markdown');
var templates    = require('metalsmith-templates');
var Handlebars   = require('handlebars');
var collections  = require('metalsmith-collections');
var permalinks   = require('metalsmith-permalinks');
var tags         = require('metalsmith-tags');
var tagsIndex    = require('./helpers/tags-index');
var gist         = require('metalsmith-gist');
var drafts       = require('metalsmith-drafts');

var concat       = require('metalsmith-concat');
var cleanCSS     = require('metalsmith-clean-css');
var uglify       = require('metalsmith-uglify')
var htmlMinifier = require("metalsmith-html-minifier");

var helpers      = require('./helpers/helpers');

helpers.handlebarsHelpers( Handlebars );

Metalsmith(__dirname)
    .use(drafts())
    .use(collections({
        articles: {
            pattern: 'articles/*.md',
            sortBy: 'date',
            reverse: true
        }
    }))
    .use(markdown())
    // .use(gist())
    .use(permalinks({
        pattern: ':title',
        relative: false
    }))
    .use(tags({
        handle: 'tags',
        template:'/partials/tags.hbt',
        path:'tags',
        sortBy: 'title',
        reverse: true
    }))
    .use(tagsIndex({
        handle: 'tag',
        path: 'tags',
        template: '/partials/tags-index.hbt',
        sortBy: 'tag',
        reverse: false
    }))
    .use(templates('handlebars'))

    .use(concat({
        files: 'styles/*.css',
        output: 'styles/main.min.css'
    }))
    .use(cleanCSS({
        files: "styles/main.min.css",
        cleanCSS: {
           noRebase: true
        }
    }))
    .use(concat({
        files: 'scripts/*.js',
        output: 'scripts/main.js'
    }))
    .use(uglify())
    .use(htmlMinifier())
    .destination('./build')
    .build(function(err, files) {
        if (err) { throw err; }
    });
