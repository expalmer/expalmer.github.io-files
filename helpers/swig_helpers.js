// var fs       = require('fs');

const metatags = require('./metatags');
const Swig = require('swig');
const moment   = require('moment');

Swig.setFilter('metaHeader', ( key, value ) => value && typeof value !== 'object' ? value + ' | ' + metatags[key] : metatags[key] );

Swig.setFilter('meta', ( key, value ) => typeof value !== 'object' && !!value ? value : metatags[key] );

Swig.setFilter('dateFormat', ( context ) => moment(context).format("LL") );

Swig.setFilter('dateGMT', ( context ) => {
  context = context === 'new' ? new Date() : context;
  return context.toGMTString();
});

Swig.setFilter('base', ( ) => metatags.base );


