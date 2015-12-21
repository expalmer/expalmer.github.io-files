const Metalsmith  = require('metalsmith');
const markdown    = require('metalsmith-markdown');
const layout      = require('metalsmith-layouts');
const collections = require('metalsmith-collections');
const permalinks  = require('metalsmith-permalinks');
const tags        = require('metalsmith-tags');
const drafts      = require('metalsmith-drafts');

const untemplatize = require('metalsmith-untemplatize');

const concat   = require('metalsmith-concat');
const cleanCSS = require('metalsmith-clean-css');
const uglify   = require('metalsmith-uglify')

const postcss = require('metalsmith-postcss');
const autoprefixer = require('autoprefixer');
const partialimport = require('postcss-partial-import');
const simplevars = require('postcss-simple-vars');
const variables = require('postcss-css-variables');
const nested = require('postcss-nested');

require('./helpers/swig_helpers');

const tagsIndex = require('./helpers/tags-index');

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
  .use(permalinks({
        pattern: ':title',
        relative: false
    }))
  .use(tags({
        handle: 'tags',
        layout: 'tag.html',
        path: 'tags/:tag/index.html',
        sortBy: 'title',
        reverse: true
    }))
  .use(tagsIndex({
      metadataKey: 'tags', // tag key
      path: 'tags',  // dir
      layout: 'tags.html'
  }))
  .use(untemplatize({
        key: 'untemplatized'
    }))
  .use(layout({
    'engine': 'swig',
    'directory': 'tpl'
  }))
  .use(postcss([
      autoprefixer({ browsers: ['last 1 version'] }),
      simplevars(),
      variables(),
      nested()
    ]))
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
  .destination('./build')
  .build( ( err, files ) => {
      if ( err ) throw err;
    });