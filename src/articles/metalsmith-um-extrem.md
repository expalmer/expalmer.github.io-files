---
title: "Metalsmith, um extremamente simples gerador de paginas estaticas feito em javascript"
titleFull: Metalsmith, um extremamente simples gerador de páginas estáticas feito em javascript
description: "Tomei coragem e resolvi criar meu blog, e escolhi o Metalsmith por ser em javascript, minha linguagem favorita."
keywords: "metalsmith, javascript, nodejs"
author: Palmer Oliveira
date: 2014-09-24T17:39:06.157Z
template: article.hbt
tags: metalsmith, javascript, nodejs
---

## Resolvi criar meu blog e escolhi o Metalsmith por ser em javascript, minha linguagem favorita.


Hoje existem alguns geradores de sites estáticos super legais, como o [jekyll](http://jekyllrb.com/),
mas resolvi procurar algo feito em javascript e encontrei o [Metalsmith](http://metalsmith.io/) criado pela turma do [Segment.io](https://segment.io/).

Vale lembrar que temos outro gerador em javascript muito bacana, o [harmonic](https://github.com/es6rocks/harmonic) feito pelo [@jaydson](https://twitter.com/jaydson).
Logo vou me aventurar no harmonic.

## Como o Metalsmith funciona ?

O Metalsmith roda com ``nodejs``, então já sabe que precisa de node na sua máquina.

Toda lógica do Metalsmith é manipulada através de plugins, ou seja, você simplesmente chama métodos encadeados e pronto!

O Metalsmith faz 3 coisinhas:

1. Lê todos os arquivos no diretório origem ``src``.
2. Chama os cada um dos métodos encadeados manipulando os arquivos.
3. Escreve o resultado no diretótio destino ``build``. ( Você escolhe o nome da pasta destino ).

## Vamos criar um pequeno blog com Metalsmith.

### 1 ) Estrutura de arquivos do Blog.
```javascript
- blog
---- index.js
---- package.json
---- src
-------- index.md
-------- posts
-------------- post-1.md
-------------- post-2.md
---- templates
-------------- index.hbt
-------------- posts.hbt
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
    "metalsmith-markdown": "^0.2.1",
    "metalsmith-permalinks": "^0.4.0",
    "metalsmith-templates": "^0.5.2",
    "metasmith": "0.0.1"
  }
}
```
Vamos instalar o Metalsmith e mais 5 dependências essenciais para um blog bacana.
- **metalsmith-collections**: Cria um objeto chamado ``collections`` com todos os posts.
- **metalsmith-markdown**: Interpreta nossos arquivos ``.md``.
- **metalsmith-permalinks**: Muda o nome original do arquivo para uma url amigável.
- **metalsmith-templates**: Permite usar um template engine.
- **handlebars**: Nosso template engine.

Aproveite e já instale as dependências. Dê o comando na raiz do diretório ``blog``.
```javascript
$ npm install
```

## Agora vamos criar as nossas páginas de fato.

### 3) blog/src/index.md
```javascript
---
template: index.hbt
---

Corpo da página index
```

### 4) blog/src/posts/post-1.md
```javascript
---
title: Meu Primeiro Post com Metalsmith
template: posts.hbt
---

Corpo do Post 1
```

### 5) blog/src/posts/post-2.md
```javascript
---
title: Meu Segundo Post
template: posts.hbt
---

Corpo do Post 2
```

## Agora criaremos nossos templates em handlebars.

### 6) blog/templates/index.hbt
```markup
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blog Index</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <h1>Index</h1>
  </header>
  <section>
    {{{contents}}}
  </section>
  <section>
    <h2>Lista dos Posts</h2>
    <ul>
      {{#each collections.posts }}
        <li>
          <a href="{{this.path}}/index.html" title="{{this.path}}">{{this.title}}</a>
        </li>
      {{/each}}
    </ul>
  </section>
  <footer>
    made with <a href="http://www.metalsmith.io/">metalsmith</a>
  </footer>
</body>
</html>
```

### 7) blog/templates/posts.hbt
```markup
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blog Posts</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <header>
    <a href="../index.html">Voltar para o Index</a>
  </header>
  <article>
    <h1>{{this.title}}</h1>
    {{{contents}}}
  </article>
  <footer>
    made with <a href="http://www.metalsmith.io/">metalsmith</a>
  </footer>
</body>
</html>
```

## Vamos dar um estilo.

### 8) blog/src/css/style.css

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
}

ul li a {
  display: inline-block;
  margin: 5px;
  color: #FF0050;
}
```

## Agora é só criar nosso arquivo principal chamando o Metalsmith.

### 9) blog/index.js
```javascript
var Metalsmith   = require('metalsmith');
var collections  = require('metalsmith-collections');
var markdown     = require('metalsmith-markdown');
var templates    = require('metalsmith-templates');
var permalinks   = require('metalsmith-permalinks');

Metalsmith(__dirname)
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
  .use(templates('handlebars')) // nossos objetos serão passados para o handlebars
  .destination('./build')       // diretório destino
  .build(function(err, files) { // escreve os aquivos no diretório build
    if (err) { throw err; }     // um handler de erro, sempre é bom
  });
```

### 9) Finalmente execute o comando na raiz do diretório ``blog``:
```javascript
$ node index.js
```

### 10) Vá até o diretório ``build`` e abra o arquivo ``index.html`` no seu browser favorito, e está pronto!

Em resumo, o Metalsmith vai ler a pasta ``src`` criar um nova pasta chamada ``build`` com o resultado de tudo feito pelos plugins.

Eu não expliquei detalhe por detalhe, mas sei que você só fazendo esse exemplo vai sacar como as coisas funcionam.

Aconselho a dar uma olhada no código de algum plugin, e veja como é fácil criar coisas no Metalsmith. Eu inclusive contribui para o plugin [metalsmith-tags](https://github.com/totocaster/metalsmith-tags) e criei outro para colocar ``gists`` dentro do blog [metalsmith-gist](https://github.com/expalmer/metalsmith-gist).

Logo irei fazer um novo post com a estrutura completa de um blog e criando plugins no Metalsmith.

Espero que tenham gostado. That's it !