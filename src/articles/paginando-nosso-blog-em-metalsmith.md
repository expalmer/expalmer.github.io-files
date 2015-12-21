---
title: "Paginando nosso blog estático em Metalsmith"
titleFull: Paginando nosso blog estático em Metalsmith
description: "Agora vamos paginar nosso blog feito em Metalsmith."
keywords: "metalsmith, javascript, nodejs"
author: Palmer Oliveira
date: 2015-03-02T16:39:06.157Z
layout: article.html
tags: metalsmith, javascript, nodejs
---

Vamos adicionar agora uma ``paginação`` para nosso blog feito com [Metalsmith](http://metalsmith.io/).

Vamos usar os mesmos arquivos do post anterior, [esses aqui](http://expalmer.github.io/criando-um-blog-estatico-com-metalsmith-contendo-tags-gists-drafts-e-um-rss-feed/), portanto vou postar apenas os arquivos novos ou que sofreram alteração.

### 1) Instale a nova dependência ``metalsmith-pagination``.

```javascript
$ npm install metalsmith-pagination --save
```

Esse ``save`` no final é para incluir automaticamente no nosso arquivo ``package.json`` nossa dependência.

### 2) Alterando o ``index.js``.

```javascript
var Metalsmith   = require('metalsmith');
var collections  = require('metalsmith-collections');
var markdown     = require('metalsmith-markdown');
var templates    = require('metalsmith-templates');
var permalinks   = require('metalsmith-permalinks');
var tags         = require('metalsmith-tags');
var gist         = require('metalsmith-gist');
var drafts       = require('metalsmith-drafts');
var pagination   = require('metalsmith-pagination'); // <-- nova dependência

var fs           = require('fs');
var Handlebars   = require('handlebars');
var moment       = require('moment');

Handlebars.registerPartial({
  'header': fs.readFileSync('./templates/partials/header.hbt').toString(),
  'footer': fs.readFileSync('./templates/partials/footer.hbt').toString()
});
Handlebars.registerHelper('dateFormat', function( context ) {
  return moment(context).format("LL");
});
Handlebars.registerHelper('dateGMT', function( context ) {
  context = context === 'new' ? new Date() : context;
  return context.toGMTString();
});
// helpers para marcar a página corrente
Handlebars.registerHelper('currentPage', function( current, page ) {
  return current === page ? 'current' : '';
});

Metalsmith(__dirname)
  .use(drafts())
  .use(collections({
      posts: {
          pattern: 'posts/*.md',
          sortBy: 'date',
          reverse: true
      }
  }))
  .use(markdown())
  .use(permalinks({
      pattern: ':title',
      relative: false
  }))
  // detalhe: o pagination usa o ``collection`` e por isso deve ser chamado após o mesmo.
  // outro detalhe: nós estamos usando também o ``permalinks`` que altera o nome das páginas,
  //                portanto precisamos declarar o pagination após ele também.
  .use(pagination({
    'collections.posts': {  // aqui vai o nome da collection, no nosso caso, collections.posts
      perPage: 2, // por página
      template: 'indexWithPagination.hbt', // o template
      first: 'index.html', // ele cria um index.html na raiz com a primeira página
      path: ':num/index.html' // modelo de como quer que sejam criadas as demais páginas
    }
  }))
  .use(gist())
  .use(tags({
    handle: 'tags',
    template:'tags.hbt',
    path:'tags',
    sortBy: 'title',
    reverse: true
  }))
  .use(templates('handlebars'))
  .destination('./build')
  .build(function(err, files) {
    if (err) { throw err; }
  });

```

Note que no arquivo ``index.js`` criamos um **handlebars helper** chamado ``currentPage``, ele será usado para colocar uma classe css na página corrente.


### 3 ) Alterando o ``src/index.md``.

```javascript
---
template: indexWithPagination.hbt
---

Bem vindo ao meu blog! Confira abaixo meus **posts**.
```

### 4 ) Novo template ``template/indexWithPagination.hbt``.

Esse template será usado no lugar do ``template/index.hbt``, pois agora teremos que fazer o **each** no novo objeto criado pelo **metalsmith-pagination** chamado ``pagination``.

```markup
{{> header}}
  <section>
    <h1>Lista dos Posts Paginados</h1>
    <h3>Estamos na Página ({{pagination.num}})</h3>
    <ul>
    {{#each pagination.files}}
      <li>
        <a href="/{{this.path}}/index.html" title="{{this.title}}">
          <h2>{{this.title}}</h2>
          <time datetime="{{ dateFormat this.date }}">{{ dateFormat this.date }}</time>
        </a>
      </li>
    {{/each}}
    </ul>
    <ul class="pagination">
      {{#if pagination.previous}}
        <li><a href="/{{pagination.previous.path}}">Prev</a></li>
      {{else}}
        <li class="inactive"><span>Prev</span></li>
      {{/if}}
      {{#each pagination.pages}}
        <li class="{{currentPage ../pagination.num this.pagination.num}}"><a href="/{{this.path}}">{{this.pagination.num}}</a></li>
      {{/each}}
      {{#if pagination.next}}
        <li><a href="/{{pagination.next.path}}">Next</a></li>
      {{else}}
        <li class="inactive"><span>Next</span></li>
      {{/if}}
    </ul>
  </section>
{{> footer}}

```

Vamos encher nosso blog com mais 2 posts, para ficar melhor a visualização da nossa paginação.

### 5 ) Novo Post ``src/posts/post-5.md``.

```javascript
---
title: Quinto post sobre produtividade no trabalho
template: posts.hbt
date: 2015-02-20
description: Como ser mais produtivo no trabalho
author: Palmer. Para o RSS Feed.
tags: produtividade
---

## Quinto post sobre produtividade no trabalho

- Lorem ipsum dolor.
- Lorem ipsum dolor sit.

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat amet, sapiente rem dolorum vitae aliquid illo ducimus laboriosam, quas molestiae quaerat corporis laborum! Ducimus asperiores nesciunt vel, nam sequi quasi! Similique explicabo, temporibus tenetur maxime iusto odit facere illo eligendi corrupti, consequatur soluta in itaque commodi id inventore. Rerum reiciendis necessitatibus, quaerat atque saepe, illum enim suscipit libero numquam maxime ad tempore. Dignissimos, delectus, ipsa. Mollitia veritatis vitae expedita iste hic praesentium numquam molestias quibusdam ad sed quia libero ipsum porro, cupiditate nisi. Nobis aspernatur id doloremque mollitia inventore delectus nesciunt vitae molestias. Deleniti, blanditiis, itaque. Odit voluptatem alias corporis.
```

### 6 ) Novo Post ``src/posts/post-6.md``.

```javascript
---
title: Fazer ou não fazer uma faculdade
template: posts.hbt
date: 2015-03-02
description: Será que hoje para um desenvolvedor é necessário o canudo ?
author: Palmer. Para o RSS Feed.
tags: faculdade, profissao
---

## Fazer ou não fazer uma faculdade

Lorem ``ipsum`` dolor sit amet, consectetur adipisicing elit. Eaque, at corporis recusandae eius magnam ducimus explicabo reiciendis. **Et eligendi** illo soluta laboriosam nulla, tempore, non, praesentium nobis sit facere fuga?
```

### 7 ) Adicione no final do ``src/css/style.css``.

```css
pre {
  padding: 20px;
  background: #313430;
  color: #D42EA4;
  border-radius: 4px;
}
.pagination {
  margin: 0;
  padding: 0;
}
.pagination li {
  display: inline-block;
}
.pagination li a,
.pagination li span {
  display: block;
  padding: 4px 8px;
  border: solid 1px #eee;
  color: #111;
  font-size: 0.9em;
  text-decoration: none;
}
.pagination .current a {
  color: #fff;
  background: #FF0050;
}
.pagination .inactive span {
  cursor: not-allowed;
  color: #bbb;
  background: #eee;
}
```

### 8) Finalmente execute o comando na raiz do diretório:
```javascript
$ node index.js
```

Note que agora no diretório ``build``, teremos novos arquivos em ``1/index.html, 2/index.html 3/index.html``.

Isso porque temos ``6`` posts, e configuramos para ``2`` posts por página, ficando então 3 páginas.

Se está usando o **httpster** então vá no diretório ``build`` e dê o comando ``httpster``, então abra o browser em ``http://localhost:3333/``.

Coloquei no git o exemplo e os arquivos se quiser dar uma olhada: [blog-example-with-metalsmith](https://github.com/expalmer/blog-example-with-metalsmith)

Bom acho que ficou claro, mas caso tenha dúvida é só me perguntar.

Espero que tenham gostado. That's it !



