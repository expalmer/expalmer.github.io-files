---
title: "Criando seu proprio Client Router em Javascript - Parte 1"
titleFull: Criando seu próprio Client Router em Javascript - Parte 1
description: "Sempre quis saber como funciona um router em Javascript, então resolvi criar um."
keywords: "javascript"
author: Palmer Oliveira
date: 2016-01-04T20:40:06.157Z
layout: article.html
tags: javascript
---

Lí todo código do **router** [pagejs](https://visionmedia.github.io/page.js/), e o que vamos fazer é praticamente reescrevê-lo passo a passo, e acredito que você vai aprender alguns truques assim como eu aprendi.

Dividi o post em 2 partes, esse primeiro criando um router básico, e na sequencia um mais completo.

Acredito que para quem é iniciante em Javascript o código seja um pouco hard, mas vou tentar explicar com o máximo de detalhes possíveis, e se der tudo certo, você terá escrito seu próprio router para usar em seus projetos.

## Funcionamento do router

O router deve criar **rotas**, ou seja, informar um **path** e executar um **callback** quando esse **path** for chamado.

Nosso router será uma função chamada ``micror`` (__micro r__outer...entendeu?) e seus métodos serão:

- ``micror( path, callback )`` Cria uma rota
- ``micror.go( path )`` Chama uma rota
- ``micror.run( options )`` Inicia o router


#### Criando uma rota

Aqui passamos o **path** e o **callback**.

```javascript
micror('/', function(context) {
	console.log('Home');
});
```

#### Chamando uma rota

Aqui estamos chamando o **path** ``/`` que executará a rota que criamos acima.

```javascript
micror.go('/');
```

#### Iniciando o router

Iniciar é opcional, mas iremos chamar essa função para pegar a ``url atual``e internamente executar o ``micror.go('url_atual')``.

Nessa função podemos passar um objeto com 2 opções, que também são opcionais:

- Opção para **base** url: ``{ base: '/adm' }``.
- Opção para **hash** /!#: ``{ hash: true }``.

```javascript
micror.run(); // micror.run( { base: '/adm', hash: 'true'} );
```

#### Criando uma rota com parâmetros

Nós precisamos passar parâmetros em algumas rotas, por exemplo um ``id`` de um post ``'/post/:id'``, então note esses dois pontos ``:``, isso significa que na rota **post**, vai ter um parâmetro chamado ``id`` e o mesmo é obrigatório.

Mas existem situações que você precisa de um parâmetro, mas o mesmo é opcional, como por exemplo em **posts** ``'/posts/:page/:order?'``, note que nessa rota temos o ``:page`` que é um parâmetro obrigatório, mas temos agora esse ``:order?`` onde temos um ``?`` no final, isso significa que o parâmetro é opcional.

Tudo isso vai no objeto ``context`` que explico a seguir.

```javascript
micror('/post/:id', function(context) {
	console.log(context.params.id);
});

micror('/posts/:page/:order?', function(ctx) {
	console.log(context.params.page);
	console.log(context.params.order);
});
```

#### Criando uma rota universal

Podemos também criar um rota universal usando ``*`` que será chamada com qualquer **path** que colocarmos. Mas tem que se ligar na ordem onde a declaramos, pois se colocarmos na frente de todas as outras rotas, somente ela executará e não cairá nas demais. Por isso colocamos ela sempre no final para usar como um ``not found``, ou seja, se não der ``match`` em nenhuma rota, cai nela ;)

```javascript
micror('/', function(ctx) {
	console.log('Home');
});

micror('/about', function(ctx) {
	console.log('Home');
});

micror('*', function(ctx) {
	console.log('Rota Universal - Not Found');
});
```

#### Explicando o objeto Context

Todo **callback** recebe uma instância do objeto ``Context``, nele colocamos informações da **url** como ``querystring`` e ``hash`` (quando houver). Mas nela também pegamos os parâmetros (obrigatório e/ou opcional) informados na rota, e então colocamos no atributo ``params``.

Se chamamos algo assim **micror.go('/posts/10?year=2016#results')**, note que temos várias informações aqui, temos um parâmetro que vamos chamar de __page__ ``10``, temos o __querystring__ ``year=2016``e o __hash__ ``#results``. Confira como fica o **context** aqui.

```javascript
micror('/posts/:page', function(context) {
	console.log('page', context.params.page);
	console.log('queryString', context.querystring);
	console.log('hash', context.hash);
});
```

#### Alterando a Url

Cada vez que chamamos uma rota devemos alterar a ``url``, e faremos isso com [history.replaceState][replacestate].

Bom acho que é isso, vamos criar nosso **router**. De repente algumas coisas não ficaram claras ainda, mas conforme criamos o código, as coisas vão clareando.

## 1) micror.js

Crie um arquivo chamado ``micror.js``, todo código vai nele.

```javascript

var _base = ''; // base url
var _hash = false; // controle por hash

// nosso router :)
function micror(path, callback){
	// criamos um objeto "route"
	var route = {
	  path: path,
	  keys: []
	};
	// regexp
	route.regexp = regexp(path,route.keys);
	// armazenando as rotas
	micror.callbacks.push(middleware(route, callback));
}

// objeto que guarda as rotas
micror.callbacks = [];

```

Cada vez que criamos uma rota, criamos um objeto chamado ``route`` que possui como atributos (``path``, ``keys``, ``regexp``).

O atributo ``route.regexp`` chama a função ``regexp`` passando o **path** e suas **keys** que é um array vazio. A função retorna uma **expressão regular** que será usada para comparar a rota, e junto já extrai os parâmetros para colocar dentro de ``keys``. Por exemplo, se damos o path ``/posts/:page/:order?``, é retornado ``/^\/posts\/([^\/]+)(?:\/([^\/]+))?(?:\/(?=$))?$/i``, e as ``keys`` ficarão assim ``[ { name: 0 }, { name: 'page' }, { name: 'order' } ]``.

A expressão regular acima diz que para fazer o __match__, precisa começar com **/posts** seguido de **qualquer coisa que não seja uma barra e contenha mais de um caracter**, seguido de **opcionalmente qualquer coisa que não seja uma barra e contenha mais de um caracter** e **opcionalemente termine com uma barra**. Ufa...

Note que as **keys** já estão na ordem certinha dos parâmetros que informados na rota. Os parâmetros obrigatório e/ou opcionais que usamos ``:`` e ``?``, são colocados os seus nomes (``{ name: 'page' }``), nos parâmetros normais é colocado zero (``{ name: 0 }``).

Mas para que isso tudo? Bom quando chamamos uma rota por exemplo ``micror.go('/posts/10/asc')``, já que temos nossas ``keys`` na ordem certa, consiguimos juntar essas informações para colocar no ``context``, saca só:

```javascript
// Esse é o path da rota que criamos
/posts/:page/:order?

// as keys criadas pela função regexp
[ { name: 0 }, { name: 'page' }, { name: 'order' } ]

// o path chamado foi esse
/posts/123/asc

// e finalmente temos isso no context
context.params.page = 123
context.params.order = 'asc'

```

Esse é o truque.

## 2) regexp()

Essa é a função que faz tudo que falamos acima, dá uma conferida.

```javascript
function regexp(path, keys) {
	var regex = path.replace(/\/(:?)([^\/?]+)(\??)(?=\/|$)/g,
	function(match, isVariable, segment, isOptional) {
		if(isVariable) keys.push({ name: segment });
		return isVariable ? isOptional ? '(?:\\/([^\\/]+))?' : '\\/([^\\/]+)' : '\\/' + segment;
	});
	regex = regex === '*' ? '(.*)' : (regex === '/' ? '' : regex);
	if (keys.length === 0) keys.push({name: 0});
	return new RegExp( '^' + regex + '(?:\\/(?=$))?$','i');
}
```

##  3) middleware()

Lá em cima fizemos isso ``micror.callbacks.push(middleware(route, callback));``, aqui chamamos a função ``middleware`` passando o  objeto ``route`` e o ``callback``. A função **middleware** retorna uma outra função que espera um objeto ``context`` e uma função ``next``.

Quando essa função for chamada, ela vai pegar o``context`` passado e comparar com o objeto ``route`` que o originou, comparando o  **route.regexp** com o **context.path**. Se der **match** nós preenchemos o atributo ``params`` do **context** com as ``keys`` do **route** conforme falamos acima, e finalmente chamamos o ``callback`` passando o **context**.

Caso não dê **match**, é chamado a função ``next`` que irá verificar outra rota até dar **match** ou acabar as rotas registradas.

```javascript
function middleware(route, callback) {
	return function( context, next ) {
		var match = route.regexp.exec(decodeURIComponent(context.path));
		if( match ) {
			fillParams(match, route.keys, context.params );
			return callback(context);
		}
		next();
	}
}
```

##  4) fillParams

Essa função faz aquilo que falamos lá em cima, de juntar as ``keys`` e os parâmetros que foram informados na ``url``.

```javascript
function fillParams(match, keys, params) {
	var len = match.length;
	var idx = 0;
	var key, val;
	while (++idx < len) {
		key = keys[idx - 1];
		val = match[idx];
		if (val !== undefined) {
			params[key.name] = val;
		}
	}
}
```

## 5) micror.go()

Aqui é que verificamos cada um dos ``callbacks`` das rotas que foram registrados.

Quando chamamos uma rota, primeiramente é criado uma instância do objeto ``Context``, esse objeto pega o ``path`` passado e extrai várias informações importantes como:

- ``fullPath``: O **path** original com querystring e hash.
- ``path``: Aqui é retirado a querystring e hash para poder fazer o **match** com o **route.regexp**
- ``querystring``
- ``hash``
- ``title``: Título da página

O **Context** possui também um método para fazer o ``replaceState``, e já fazemos isso após criá-lo.

Agora chamo a função ``callNextCallback`` que começa com o índice zero, e verifica se possui uma função registrada em ``micror.callbacks``, se sim, ele executa a função que é aquela função **middleware** passando o ``context`` e ela própria **callNextCallback**. Lembra que lá em cima a função ``next`` em **middleware**? Se não der **match** ele chama o **next** que é na real nossa ``callNextCallback`` somando +1 no nosso índice, e segue adiante até acabar as funções das rotas registrados...não é genial ?

```javascript
micror.go = function(path) {
	var context = new Context(path);
	context.saveState();
	var i = 0;
	function callNextCallback() {
		var callback = micror.callbacks[i++];
	  	if(!callback) {
	   		return console.log('route [', context.path, '] not found');
	  	}
	  	callback( context, callNextCallback );
	}
	callNextCallback();
};
```

## 6) micror.run()

Aqui é simples, inicializamos nossas **options**, depois pegamos a ``url`` atual e já chamamos uma rota.

```javascript
micror.run = function(opts) {
	_base = opts && opts.base ? opts.base : '';
	_hash = opts && opts.hash ? '#!' : false;
	var url = location.pathname + location.search + location.hash;
	url = _base ? url.replace(_base, '') : '';
	if( _hash && ~location.hash.indexOf('#!') ) {
	  url = location.hash.substr(2) + location.search;
	}
	micror.go(url);
};

```

##  7) Context()

```javascript
function Context(path) {
	path = _base + (_hash ? '/#!' : '') + path.replace(_base,'');
	path = path.length > 1 ? path.replace(/\/$/,'') : path;
	this.fullPath = path;
	path = _hash ? path.split('#!')[1] : (_base ? path.replace(_base,'') : path);
	this.title = document.title;
	this.params = {};
	var h = path.split('#');
	path = h[0];
	this.hash = h[1] || '';
	var q = path.split('?');
	path = q[0];
	this.querystring = q[1] || '';
	this.path = path || '/';
}

Context.prototype.saveState = function() {
	history.replaceState(this.state, this.title, this.fullPath );
};

```

## Código completo

Segue o código completo agora.

```javascript
var _base = '';
var _hash = false;

function micror(path, callback){
    var route = {
      path: path,
      keys: []
    };
    route.regexp = regexp(path,route.keys);
    micror.callbacks.push(middleware(route, callback));
}

micror.callbacks = [];

micror.go = function(path) {
    var context = new Context(path);
    context.saveState();
    var i = 0;
    function callNextCallback() {
        var callback = micror.callbacks[i++];
        if(!callback) {
            return console.log('route [', context.path, '] not found');
        }
        callback( context, callNextCallback );
    }
    callNextCallback();
};

micror.run = function(opts) {
	_base = opts && opts.base ? opts.base : '';
	_hash = opts && opts.hash ? '#!' : false;
	var url = location.pathname + location.search + location.hash;
	url = _base ? url.replace(_base, '') : '';
	if( _hash && ~location.hash.indexOf('#!') ) {
	  url = location.hash.substr(2) + location.search;
	}
	micror.go(url);
};

function Context(path) {
    path = _base + (_hash ? '/#!' : '') + path.replace(_base,'');
    path = path.length > 1 ? path.replace(/\/$/,'') : path;
    this.fullPath = path;
    path = _hash ? path.split('#!')[1] : (_base ? path.replace(_base,'') : path);
    this.title = document.title;
    this.params = {};
    var h = path.split('#');
    path = h[0];
    this.hash = h[1] || '';
    var q = path.split('?');
    path = q[0];
    this.querystring = q[1] || '';
    this.path = path || '/';
}

Context.prototype.saveState = function() {
    history.replaceState(this.state, this.title, this.fullPath );
};

function middleware(route, callback) {
    return function( context, next ) {
        var match = route.regexp.exec(decodeURIComponent(context.path));
        if( match ) {
            fillParams(match, route.keys, context.params );
            return callback(context);
        }
        next();
    }
}

function fillParams(match, keys, params) {
    var len = match.length;
    var idx = 0;
    var key, val;
    while (++idx < len) {
        key = keys[idx - 1];
        val = match[idx];
        if (val !== undefined) {
            params[key.name] = val;
        }
    }
}

function regexp(path, keys) {
    var regex = path.replace(/\/(:?)([^\/?]+)(\??)(?=\/|$)/g,
    function(match, isVariable, segment, isOptional) {
        if(isVariable) keys.push({ name: segment });
        return isVariable ? isOptional ? '(?:\\/([^\\/]+))?' : '\\/([^\\/]+)' : '\\/' + segment;
    });
    regex = regex === '*' ? '(.*)' : (regex === '/' ? '' : regex);
    if (keys.length === 0) keys.push({name: 0});
    return new RegExp( '^' + regex + '(?:\\/(?=$))?$','i');
}

```

## Testando

Crie um arquivo chamado ``index.html``, e coloque o código abaixo. Agora você precisa levantar um servidor **apache**, **node**, **python** ... eu sempre recomendo o [httpster][httpster].

```markup
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>micro router</title>
  <base href="/">
  <style>
    body {
      background: #fff;
      color: #666;
      font-size: 1.1em;
    }
    a {
      color: #444;
      text-decoration: none;
      text-shadow: -1px -1px 1px rgba(0,0,0,0.1);
    }
    a:hover {
      color: #44666D;
    }
    h1 a {
      display: inline-block;
      color: #FC0E49;
    }
    .limiter {
      margin: 0 auto;
      max-width: 600px;
      text-align: center;
    }
    ul li {
      display: inline-block;
      margin: 0 10px;
    }
    .display {
      margin: 20px auto;
      padding: 20px;
      border-radius: 10px;
      border: solid 1px #eee;
    }
  </style>
</head>
<body>
  <div class="limiter">
    <h1><a href="">micro router</a></h1>
    <ul>
      <li><a href="./">Home</a></li>
      <li><a href="./about">About</a></li>
      <li><a href="./post/42">Post</a></li>
      <li><a href="./posts/1/asc">Posts</a></li>
      <li><a href="./not-found">Not Found</a></li>
    </ul>
    <div class="display"></div>
  </div>
  <script src="/micror.js"></script>
  <script>

    var display = document.querySelector('.display');

    micror('/', function(ctx) {
      display.textContent = 'Rota Home';
    });

    micror('/about', function(ctx) {
      display.textContent = 'Rota About';
    });

    micror('/post/:id', function(ctx) {
      display.textContent = 'Rota Post com id = ' + ctx.params.id;
    });

    micror('/posts/:page/:order?', function(ctx) {
      var html = 'Rota Posts com page = ' + ctx.params.page;
          html += ' e order = ' + ctx.params.order || '';
      display.textContent = html;
    });

    micror('*', function(ctx) {
      display.textContent = 'PAGE NOT FOUND';
    });

    micror.run();

    // Event Listener para os Links
    var links = document.querySelectorAll('a');
    var len = links.length;
    while( len-- ) {
      links[len].addEventListener('click', function(event) {
        var element = event.target;
        var path = element.pathname + element.search + (element.hash || '');
        micror.go(path);
        event.preventDefault();
      });
    }

  </script>
</body>
</html>

```

Bom, depois teste passando a ``base``.

```javascript
micror.run({ base: '/adm'}); //(não esqueça de mudar a meta tag **base** no html né)
```
E o ``hash``.

```javascript
micror.run({ hash: true});
```

Teste, leia o código e se divirta. Caso tenha alguma dúvida me pergunte.

Post bem comprido :P, no próximo vamos colocar umas features bem legais.

Se conseguiu criar o router, **deixe seu comentário aqui em baixo :)**.

Espero que tenham gostado. That's it !

[replacestate]: https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_replaceState()_method
[httpster]: https://simbco.github.io/httpster/