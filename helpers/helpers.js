var fs       = require('fs');
var moment   = require('moment');
var metatags = require('./metatags');

module.exports = {

  handlebarsHelpers: function( Handlebars ) {

    Handlebars.registerPartial('header', fs.readFileSync('./templates/partials/header.hbt').toString());
    Handlebars.registerPartial('footer', fs.readFileSync('./templates/partials/footer.hbt').toString());

    Handlebars.registerHelper('metaHeader', function( key, value ) {
      return value && typeof value !== 'object' ? value + ' | ' + metatags[key] : metatags[key];
    });

    Handlebars.registerHelper('meta', function( key, value ) {
      return typeof value !== 'object' && !!value ? value : metatags[key];
    });

    Handlebars.registerHelper('replaceTrace', function( value ) {
      if ( typeof value === 'object' ) {
        value = value.toString();
      }
      if ( !!value ) {
        return value.replace(/\-/g,' ');
      }
      return false;
    });

    Handlebars.registerHelper('toPath', function( value ) {
      if ( typeof value === 'object' ) {
        value = value.toString();
      }
      return value;
    });

    Handlebars.registerHelper('dateFormat', function( context ) {
      return moment(context).format("LL");
    });

    Handlebars.registerHelper('dateGMT', function( context ) {
      context = context === 'new' ? new Date() : context;
      return context.toGMTString();
    });

    Handlebars.registerHelper('base', function() {
      return metatags.base;
    });

    Handlebars.registerHelper('paginator', function( coll, offset, limit ) {
      return coll.slice( offset, limit + 1 );
    });
  }
};
