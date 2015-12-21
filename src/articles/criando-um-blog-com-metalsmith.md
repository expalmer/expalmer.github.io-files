---
title: "Criando um Blog Estatico com Metalsmith contendo tags, gists, drafts e um rss feed"
titleFull: Criando um Blog Estático com Metalsmith contendo tags, gists, drafts e um rss feed
description: "Dessa vez vamos criar novamente um blog estático, mas agora contendo tags, gists, drafts e rss feed"
keywords: "metalsmith, javascript, nodejs, blog estatico, tags, gist, drafts, rss"
author: Palmer Oliveira
date: 2014-10-20T15:39:06.157Z
layout: article.html
tags: metalsmith, javascript, nodejs
---

Vamos complementar nosso blog feito em [Metalsmith](http://metalsmith.io/) com as features ``tags``, ``gist``, ``drafts`` e um ``rss feed``.

Lembra dos plugins que mencionei no post passado? Pois é, o de ``tags`` [metalsmith-tags](https://github.com/totocaster/metalsmith-tags) eu contribui, e o plugin de ``gist`` [metalsmith-gist](https://github.com/expalmer/metalsmith-gist) eu criei, e esses que usaremos aqui :).

O plugin ``drafts`` é para rascunhos, você cria seus posts, mas eles não serão gerados na pasta``build``.

O ``rss feed`` fiz do meu jeito, mas recentemente criaram um plugin pra isso [metalsmith-feed](https://github.com/hurrymaplelad/metalsmith-feed). Depois dê uma olhada!

Antes de postar os arquivos, queria te dar uma dica dessa **lib** muito legal chamada [httpster](http://simbco.github.io/httpster/).
Use ela para levantar um server ``nodejs`` em qualquer diretório que quiser.

Instale globalmente em sua máquina ``npm -g install httpster``, depois entre na pasta desejada ( no nosso caso, entre na pasta ``build`` ) e dê o comando ``httpster`` então será levantado um servidor em ``http://localhost:3333/``.
É mágico! Estou usando direto para abrir meus projetos locais.

### 1 ) Estrutura de arquivos do Blog.
```javascript
- blog
---- index.js
---- package.json
---- src
-------- index.md
-------- rss.xml
-------- css
-------------- style.css
-------- posts
-------------- post-1.md
-------------- post-2.md
-------------- post-3.md
-------------- post-4.md
---- templates
-------------- partials
----------------------- footer.hbt
----------------------- header.hbt
-------------- index.hbt
-------------- posts.hbt
-------------- rss.hbt
-------------- tags.hbt
```

### 2) package.json
```javascript
{
  "name": "blog",
  "description": "meu blog legal",
  "version": "0.0.1",
  "dependencies": {
    "handlebars": "^2.0.0",
    "metalsmith": "^0.11.0",
    "metalsmith-collections": "^0.6.0",
    "metalsmith-drafts": "0.0.1",
    "metalsmith-gist": "^0.3.0",
    "metalsmith-markdown": "^0.2.1",
    "metalsmith-permalinks": "^0.4.0",
    "metalsmith-tags": "^0.6.1",
    "metalsmith-templates": "^0.5.2",
    "metasmith": "0.0.1",
    "moment": "^2.8.3"
  }
}
```
Vamos comentar as dependências novamente.
- **metalsmith-drafts**: Criar arquivos do tipo rascunho.
- **metalsmith-collections**: Cria um objeto chamado ``collections`` com todos os posts.
- **metalsmith-markdown**: Interpreta nossos arquivos ``.md``.
- **metalsmith-permalinks**: Muda o nome original do arquivo para uma url amigável.
- **metalsmith-gist**: Pega gists do github e inclui na página.
- **metalsmith-tags**: Cria páginas conforme as tags informadas.
- **metalsmith-templates**: Permite usar um template engine.
- **handlebars**: Nosso template engine.
- **moment**: Para manipular datas.

Instale as dependências. Dê o comando na raiz do diretório ``blog``.
```javascript
$ npm install
```

## Vou começar pelo arquivo ``index.js``, porque precisamos criar alguns Handlebars helpers.

Precisaremos criar helpers para **partials** e **formatação de datas**. Note que criei esses 3 helpers que usaremos em nossos templates.
Usarei também o plugin [moment](http://momentjs.com/) para manipular datas.

### 3) index.js

```javascript

var Metalsmith   = require('metalsmith');
var collections  = require('metalsmith-collections');
var markdown     = require('metalsmith-markdown');
var templates    = require('metalsmith-templates');
var permalinks   = require('metalsmith-permalinks');
var tags         = require('metalsmith-tags');
var gist         = require('metalsmith-gist');
var drafts       = require('metalsmith-drafts');

var fs           = require('fs');
var Handlebars   = require('handlebars');
var moment       = require('moment');

// Handlebars Helpers
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

Metalsmith(__dirname)
  .use(drafts())                 // páginas com atributo 'draft: true' não serão geradas.
  .use(collections({             // nos dará acesso a um objeto chamado 'collections' ...
      posts: {                   // ... com todos os posts
          pattern: 'posts/*.md', // aqui é o lugar onde estão nossos posts
          sortBy: 'date',        // ordenar por data
          reverse: true          // ordenar da data mais recente para a mais antiga
      }
  }))
  .use(markdown())        // vai ler todos arquivos .md e transformar em um objeto
  .use(permalinks({       // vai mudar o arquivo destino no padrão {title}/index.html
      pattern: ':title',
      relative: false
  }))
  .use(gist()) // adiciona gists nas páginas desejadas.
  .use(tags({  // criará páginas conforme as tags informadas
    handle: 'tags',
    template:'tags.hbt',
    path:'tags',
    sortBy: 'title',
    reverse: true
  }))
  .use(templates('handlebars')) // nossos objetos serão passados para o handlebars
  .destination('./build')       // diretório destino
  .build(function(err, files) { // escreve os aquivos no diretório build
    if (err) { throw err; }     // um handler de erro, sempre é bom
  });
```

## Páginas do Blog

### 4) src/index.md

```javascript
---
template: index.hbt
---

Bem vindo ao meu blog! Confira abaixo meus **posts**.

```

### 5) src/posts/post-1.md

Aqui temos campos novos como ``date, description, author e tags``.

```javascript
---
title: Meu Primeiro Post com Metalsmith
template: posts.hbt
date: 2014-03-01
description: Como criar um post com Metalsmith. Para o RSS Feed.
author: Palmer. Para o RSS Feed.
tags: metalsmith, nodejs, javascript
---

## Aprendendo a usar o [Metalsmith](http://metalsmith.io).

### Porque usar Metalsmith ?

- É fácil.
- Divertido.
- É em javascript.
- Eu curti.

```

### 6) src/posts/post-2.md

Neste arquivo colocamos um bloco de código markdown.

```javascript
---
title: Meu Segundo Post sobre MEAN
template: posts.hbt
date: 2014-03-01
description: Use MEAN facilmente. Para o RSS Feed.
author: Palmer. Para o RSS Feed.
tags: mongodb, express, angular, nodejs, javascript
---

## Aprenda a usar uma solução fullstack de javascript

### Porque usar MEAN ?

- Porque você usa um única linguagem.
- Divertido.
- É em javascript.
- Eu curti.

  ```javascript

  // server.js

  ...

  app.configure(function() {

    // set up our express application
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());

    app.set('view engine', 'ejs');

    // required for passport
    app.use(express.session({ secret: 'mysecret' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

  });

  ...

  ```\aqui são só 3 as aspas, então retire esse comentário

```


### 7) src/posts/post-3.md

Esse é nosso post do tipo **rascunho**, note o campo ``draft: true``, ou seja, esse post não será gerado na pasta ``build``.

```javascript
  ---
  title: Um Post que ainda não está pronto, portanto fica em draft
  draft: true
  template: posts.hbt
  date: 2014-10-20
  description: Post Não Pronto. Para o RSS Feed.
  author: Palmer. Para o RSS Feed.
  tags: nodejs
  ---

  ## Rest com NodeJS

  ### Porque usar Node ?

  Tenho que ver o que escrever ainda.

```

### 8) src/posts/post-4.md


Neste arquivo estamos usando o plugin **metalsmith-gist**, você informa o usuário e o nome da hash do gist ``gist: expalmer/43952d905d75693dea0c``, e depois referencia ele no corpo do post.
Nesse exemplo o gist original [é esse aqui](https://gist.github.com/expalmer/43952d905d75693dea0c).

```javascript
  ---
  title: Um Post de React com um Gist do Github
  template: posts.hbt
  date: 2014-10-19
  description: Usando um Gist de React. Para o RSS Feed.
  author: Palmer. Para o RSS Feed.
  tags: react, javascript
  gist: expalmer/43952d905d75693dea0c
  ---

  ## Começando com [React](http://facebook.github.io/react/).

  ### Porque usar React ?

  - É rápido.
  - É organizado e modularizado.
  - É em javascript.
  - Eu curti.

  Vamos começar então.

  gist:expalmer/43952d905d75693dea0c

```

### 9) src/rss.xml


Essa página irá somente conter os dados para o ``rss``. Aqui eu coloquei ``base:http://localhost:3333`` mas depois você deve colocar um endereço certinho, no caso o do seu blog.

```javascript
  ---
  template: rss.hbt
  untemplatized: 1
  base: http://localhost:3333
  name: Palmer Oliveira
  title: Meu Blog
  description: Um Blog Sobre Deselvolvimento Web
  image: http://localhost:3333/myImage.jpg
  ---

```


## Vamos agora para os **Templates**.

### 10) templates/index.hbt

Aqui aplicamos nosso helper de ``partials`` com o header e o footer.

```markup
  {{> header}}
    <section>
      {{{contents}}}
    </section>
    <section>
      <h1>Lista dos Posts</h1>
      <ul>
        {{#each collections.posts }}
          <li>
            <a href="{{this.path}}/index.html" title="{{this.title}}">
              <h2>{{this.title}}</h2>
              <time datetime="{{ dateFormat this.date }}">{{ dateFormat this.date }}</time>
            </a>
          </li>
        {{/each}}
      </ul>
    </section>
  {{> footer}}

```

### 11) templates/partials/header.hbt

```markup
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Meu Blog</title>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body>
    <header>
      <h1>Meu Blog</h1>
      <p>Assine nosso <a href="/rss.xml">rss</a>.</p>
    </header>
```

### 12) templates/partials/footer.hbt

```markup
      <footer>
        made with <a href="http://www.metalsmith.io/">metalsmith</a>
      </footer>
    </body>
  </html>
```

### 13) templates/posts.hbt

Aqui usaremos também nosso ``partials`` e a função para ``formatação de datas``. Note também que temos acesso as ``tags`` informadas no corpo dos posts, então podemos dar um **each** neles.

```markup
  {{> header}}
    <section>
      <a href="/">Voltar para o Index</a>
    </section>
    <article>
      <h1>{{this.title}}</h1>
      <time datetime="{{ dateFormat this.date }}">{{ dateFormat this.date }}</time>
      <ul class="post__tags">
        {{#each this.tags }}
          <li>
            <a href="/tags/{{this}}.html" title="Posts sobre {{this}}">{{this}}</a>
          </li>
        {{/each}}
      </ul>
      <div class="post__body">
        {{{contents}}}
      </div>
    </article>
  {{> footer}}
```

### 14) templates/tags.hbt

Aqui é o template usado pelo plugin de ``tags``.

```markup
  {{> header}}
    <section>
      <a href="/">Voltar para o Index</a>
    </section>
    <section>
      <h1>Tag: <strong>{{tag}}</strong></h1>
      <ul>
      {{#each posts }}
        <li>
            <a href="/{{this.path}}/index.html" title="{{this.title}}">
              <h2>{{this.title}}</h2>
              <time datetime="{{ dateFormat this.date }}">{{ dateFormat this.date }}</time>
            </a>
          </li>
      {{/each}}
      </ul>
    </section>
  {{> footer}}
```

### 15) templates/rss.hbt

Aqui é o template usado pela página ``src/rss.xml`` para criar nosso **rss feed**.

```markup
  <?xml version="1.0" encoding="UTF-8" ?>
  <rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#">
    <channel>
      <title><![CDATA[{{this.title}}]]></title>
      <atom:link href="{{this.base}}/rss.xml" rel="self" type="application/rss+xml"/>
      <link>{{this.base}}</link>
      <description><![CDATA[{{this.description}}]]></description>
      <image>
        <url>{{this.image}}</url>
        <title>{{this.title}}</title>
        <link>{{this.base}}</link>
      </image>
      <pubDate>{{dateGMT 'new'}}</pubDate>
      <lastBuildDate>{{dateGMT 'new'}}</lastBuildDate>
      <language>en-US</language>
      <generator>Metalsmith custom plugin</generator>
      <ttl>60</ttl>
      {{#each collections.posts }}
      <item>
        <title><![CDATA[{{this.title}}]]></title>
        <description><![CDATA[{{this.description}}]]></description>
        <link>{{../this.base}}/{{this.path}}/</link>
        <guid isPermaLink="true">{{../this.base}}/{{this.path}}/</guid>
        {{#each this.tags }}
        <category><![CDATA[{{this}}]]></category>
        {{/each}}
        <dc:creator><![CDATA[{{this.author}}]]></dc:creator>
        <pubDate>{{dateGMT this.date}}</pubDate>
        <content:encoded>
          <![CDATA[{{{contents}}}]]>
        </content:encoded>
      </item>
      {{/each}}
    </channel>
  </rss>
```

### 16) src/css/style.css

Vamos colocar um estilo.

```css
* {
  padding: 0;
  margin: 0;
}
body {
  margin: 30px auto;
  max-width: 600px;
  text-align: center;
  font-size: 100%;
  font-family: 'Georgia', 'Arial', serif;
  color: #111;
  background: #fff;
}

a {
  color: #999;
}
a:hover {
  color: #FF0050;
}

header,
section,
article,
footer {
  margin-top: -1px;
  padding: 20px;
  border: solid 1px #eee;
}

ul li {
  list-style: none;
  margin: 20px 0;
}

ul li a {
  display: inline-block;
  margin: 5px;
  color: #FF0050;
}

ul li a:hover { color: #FF578B; }

section h1 {
  font-size: 2em;
}

time {
  display: inline-block;
  padding: 2px 4px;
}

.post__tags li {
  display: inline-block;
}
.post__tags li a {
  display: inline-block;
  margin: 5px 0;
  padding: 3px 6px;
  color: #fff;
  background: #222;
  text-decoration: none;
  border-radius: 5px;
  border: solid 1px #000;
}
.post__tags li a:hover {
  color: #fff;
  background: #FF0050;
}

.post__body {
  margin: 20px 0;
  padding: 20px 0;
  text-align: left;
  border-top: solid 1px #eee;
}
.post__body h2, .post__body h3 {
  margin: 10px 0;
}
.post__body ul {
  padding-left: 40px;
}
.post__body ul li {
  list-style: square;
}
.post__body p {
  margin: 1rem 0;
  font-size: 1em;
  line-height: 1.7;
}
pre {
  padding: 20px;
  background: #313430;
  color: #64FA0F;
  border-radius: 4px;
}
```

### 17) Finalmente execute o comando na raiz do diretório ``blog``:
```javascript
$ node index.js
```

Lembra da dica? Vá até a pasta ``build`` e dê o comando ``httpster``, então abra o browser em ``http://localhost:3333/``. Confere lá como ficou.


O post ficou meio longo eu sei, mas usando essa base, você pode criar seu blog com várias features bacanas.

Neste blog eu uso mais alguns plugins como ``metalsmith-concat``, ``metalsmith-clean-css``, ``metalsmith-uglify``, ``metalsmith-html-minifier``, claro que você pode usar um ``grunt`` ou ``gulp`` da vida pra isso.

Se tiver alguma dúvida, ficarei feliz em ajuda-lo!

Espero que tenham gostado. That's it !

