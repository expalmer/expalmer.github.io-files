
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

  opts.sortBy = ['tag','total'].indexOf(opts.sortBy) === 0 ? opts.sortBy : 'total';
  opts.reverse = opts.reverse || false;

  var tagName = function( x ) {
    return x.split("/")[1].split(".")[0] || false;
  }

  var isNotEmpty = function( obj ) {
    var x;
    for ( x in obj ) {
      return true;
    }
    return false;
  }

  var sortBy = function( a, b ) {
    a = a[opts.sortBy];
    b = b[opts.sortBy];
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (b > a) return -1;
    if (a > b) return 1;
    return 0;
  };

  return function( files, metalsmith, done ) {

    var tags = [],
        tag,
        data,
        file,
        post,
        t;

    for ( file in files ) {
      if( file.split('/')[0] === opts.path ) {
        tag = tagName( file );
        if( tag ) {
          tags.push({ tag: tag, total: files[file].posts.length });
        }
        files[opts.path + '/' + tag + '/index.html'] = files[file];
        delete files[file];
      }

    }

    if( isNotEmpty( tag ) ) {
      tags.sort(sortBy);
      if ( opts.reverse ) {
        tags.reverse();
      }

      files[opts.path + '/' + 'index.html'] = {
        template: opts.template,
        mode: '0644',
        contents: '',
        tags: tags,
        tagsPath: opts.path
      };
    }

    done();

  }

}
