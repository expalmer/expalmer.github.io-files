
var path = require('path');
var join = path.join;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

function plugin( opts ) {

  if( !opts.path ) {
    return false;
  }

  return function( files, metalsmith, done ) {
    var tags = metalsmith._metadata[opts.metadataKey];
    if( !tags ) {
      return done();
    }
    var tagsObj = Object.keys(tags)
      .map(function( tag ) {
        return {
          name: tag,
          total: tags[tag].length
        }
      });

    var page = {
        layout: opts.layout,
        contents: '',
        tags: tagsObj,
        path: opts.path
      };
    files[opts.path + '/index.html'] = page;
    done();
  }

}
