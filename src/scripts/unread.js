;(function() {

  'use strict';

  function unread() {

    if( typeof localStorage === "undefined" ) return;

    var posts = document.querySelectorAll('.post__item');
    var href = window.location.href.toString();
    var db = localStorage;
    var EXP = 'expalmer.github.io';
    var data = db.getItem(EXP) || "[]";
    var arr = JSON.parse(data);
    var url;

    if (arr.indexOf(href) === -1) {
      arr.push(href);
      db.setItem(EXP, JSON.stringify(arr));
    }

    if( 0 === posts.length ) {
      return;
    }

    for(var x in posts) {
      if( posts.hasOwnProperty(x) ) {
        url = posts[x].getAttribute('href');
        if( arr.indexOf(url) === -1 ) {
          posts[x].classList.add('unread');
        }
      }
    }

  }

  window.unread = unread;

})(this);