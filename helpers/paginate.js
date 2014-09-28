
var clone = require('lodash.clone'),
    path  = require('path');

module.exports = paginateCollections;

function paginateCollections() {

  var isPaged = function ( file ) {

    var opt = file.paginateCollection ? file.paginateCollection.split('|') : [];
    if( opt.length !== 3 ) {
      return false;
    }
    return {
      collection: opt[0],
      perPage: parseInt(opt[1]),
      dist: opt[2]
    };

  };

  var paginate = function ( options, collectionLength, file, files ) {

    var total = Math.ceil( collectionLength / options.perPage ),
        first = files[file],
        ext = path.extname(file),
        pre = options.dist || file.substr(0, file.lastIndexOf(ext)),
        last = first,
        current = false,
        currentName;

    var names = [];

    names.push(file);

    first.pagination = {
      prev: current,
      next: {},
      total: total,
      start: 0,
      end: options.perPage - 1
    };

    for ( var i = 1; i < total; i += 1 ) {

      currentName = pre + ( i + 1 ) + ext;
      current = clone( first, true,  function (value) {
        if ( Buffer.isBuffer(value) ) {
          return value.slice();
        }
      });

      last.pagination.next = current;
      current.pagination.prev = last;
      current.pagination.start = i * options.perPage;
      current.pagination.end = i * options.perPage + options.perPage - 1;

      files[currentName] = current;
      names.push(currentName);

      last = current;
    }

    // names.forEach(function(x){
    //   console.log(x);
    //   console.log(files[x]);
    // });

  };

  return function ( files, metalsmith, done ) {
    var collections = metalsmith.metadata(),
        file,
        options;

    for ( file in files ) {
      options = isPaged( files[file] );
      if ( options ) {
        paginate( options, collections[options.collection].length, file, files );
      }
    }

    done();
  }
}
