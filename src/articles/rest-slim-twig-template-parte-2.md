---
title: "Criando um Rest com Slim Framework e Illuminate Database em poucos minutos - parte 2"
titleFull: Criando um Rest com Slim Framework em poucos minutos - parte 2
description: "Usando Slim Framework juntamente com o Twig Template, Illuminate Database e Validate."
keywords: "PHP, SlimFramework, Illuminate Database, Illuminate Validation, Twig Template"
author: Palmer Oliveira
date: 2015-02-22T14:00:36.157Z
layout: article.html
tags: php, slimframework
---

No post passado vimos como iniciar um rest com o [Slim Framework](http://slimframework.com/), mas neste post resolvi mudar a abordagem, vamos fazer um ``CRUD`` usando o [Twig Template](http://twig.sensiolabs.org/), [Illuminate Database](https://github.com/illuminate/database), [Illuminate Validation](https://github.com/illuminate/validation). Juntos eles formam um bom time!

Vou postar todo código de novo, pois fiz umas modificações na organização dos arquivos, removi, alterei e inclui novos arquivos, e acredito que ficou bem mais organizado. Retirei a parte do REST por enquanto, deixarei apenas o CRUD, mas logo farei novamente o REST para ser consumido pela nossa aplicação no ``client side`` por uma lib javascript.

### 1) Os dados do banco MySql, use o mesmo que usamos no post passado!

### 2 ) Estrutura de arquivos do APP
```javascript

slim-rest
├── app
│   ├── config
│   │   ├── services.php
│   │   └── twig.php
│   ├── controllers
│   │   ├── baseController.php
│   │   └── guitarController.php
│   ├── models
│   │   └── appModels.php
│   ├── views
│   │   ├── cache
│   │   └── shared
│   │   │   └── layout.html
│   │   ├── guitarForm.html
│   │   ├── guitars.html
│   │   └── index.html
│   ├── routes.php
├── public
│   ├── css
│   │   └── main.css
│   ├── js
│   │   └── app.php
├── .htaccess
├── composer.json
└── index.php

```

### 3) composer.json

```javascript
{
  "require": {
    "slim/slim": "2.4.3",
    "slim/views": "0.1.2",
    "twig/twig": "v1.16.2",
    "illuminate/database": "v4.2.9",
    "illuminate/validation": "*",
    "illuminate/filesystem": "*",
    "illuminate/translation": "*",
    "itsgoingd/slim-services": "dev-master"
  },
  "autoload": {
    "classmap": [
      "app/controllers",
      "app/models"
    ]
  }
}


```
Vamos comentar as dependências.
- **slim/slim**: Nosso framework.
- **slim/views**: Para permitir usar um template engine.
- **twig/twig**: Nosso template
- **illuminate/database**: Nosso ORM.
- **illuminate/validation**: Para fazer as validações dos dados.
- **illuminate/filesystem, illuminate/translation**: São requeridos pelo slim-services para fazer as tretas dele.
- **itsgoingd/slim-services**: É uma lib para adicionar o serviços de uma forma simples no slim.


## 4) Instalando as dependências com Composer.

1. Crie o diretório ``slim-rest``.
2. Baixe o Composer.
```bash
$ curl -sS https://getcomposer.org/installer | php
```
3. Instale as dependências.
```bash
$ php composer.phar install
```

Aqui temos um detalhe legal, no ``composer.json`` note o trecho ``"autoload"``, dentro do ``"classmap"`` estamos mapeando tudo que for classe dentro dos diretórios informados, isso significa que não precisa ficar dando include das classes que estiverem dentro das pastas informadas.

Mas tem outro ponto, onde temos que dar um comando para esse mapeamento acontecer, faça assim no terminal dentro da pasta raiz.

```bash
$ php composer.phar dump-autoload
```

Isso vai criar os mapeamentos, que você pode acompanhar dentro da pasta ``vendor/composer/autoload_classmap.php``. Lindo né! Lembre-se que quando criar uma pasta nova, precisa dar o comando novamente.

Não se esqueça desse comando, se alguma classe não for reconhecida pelo Slim, é bem provável que você tenha que rodar ele.

Vamos para os arquivos.

## 5) index.php

Esse é nosso arquivo principal de entrada do APP.

```php
<?php
# === Para mostrar todos erros
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
ini_set('display_errors','On');

# === Session
session_cache_limiter(false);
@session_start();

# === Constants
# ==================================================
// coloque o caminho certo do teu server
define("_BASEURL", 'http://localhost/slim-rest/');

# === Autoload
# ==================================================
require_once 'vendor/autoload.php';

# === Slim Initialize
# ==================================================
$app = new \Slim\Slim(array(
  'debug'                => true,
  'mode'                 => 'development',
  'templates.path'       => 'app/views',
  'database.fetch'       => PDO::FETCH_CLASS,
  'database.default'     => 'main',
  'database.connections' => array(
    // coloquei os dados do banco diretamente aqui agora.
    'main' => array(
      'driver'    => 'mysql',
      'host'      => 'localhost',
      'database'  => 'music',
      'username'  => 'root',
      'password'  => 'root',
      'charset'   => 'utf8',
      'collation' => 'utf8_unicode_ci',
      'prefix'    => ''
    )
  )
));

# === Slim Services
# ==================================================
require_once 'app/config/services.php';

# === Twig Template
# ==================================================
require_once 'app/config/twig.php';

# === Routes
# ==================================================
require_once 'app/routes.php';

# === Run Slim
$app->run();

```

## 6) .htaccess

```bash
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [QSA,L]
```

## 7) app/config/services.php

```php
<?php
use SlimServices\ServiceManager;
$services = new ServiceManager( $app );
$services->registerServices(array(
  'Illuminate\Events\EventServiceProvider',
  'Illuminate\Database\DatabaseServiceProvider',
  'Illuminate\Filesystem\FilesystemServiceProvider',
  'Illuminate\Translation\TranslationServiceProvider',
  'Illuminate\Validation\ValidationServiceProvider'
));
```

## 8) app/config/twig.php

```php
<?php
$twig = new \Slim\Views\Twig();
$app->view( $twig );
$app->view->parserOptions = array(
  'charset'          => 'utf-8',
  'cache'            => realpath('app/views/cache'),
  'auto_reload'      => true,
  'strict_variables' => false,
  'autoescape'       => true
);
/* Twig Globals
=========================================================== */
# O que setarmos aqui, será visto dentro das views, simple assim.
$twig->getEnvironment()->addGlobal('baseUrl', _BASEURL);
$twig->getEnvironment()->addGlobal('public', _BASEURL . 'public');
```

## 9) app/models/appModels.php

```php
<?php

use Illuminate\Database\Eloquent\Model as Eloquent;

class Brands extends Eloquent
{
  protected $table = 'brands';
}

class Series extends Eloquent
{
  protected $table = 'series';
}

class Guitars extends Eloquent
{
  protected $table = 'guitars';

  public function Brand() {
    return $this->hasOne('Brands','id', 'fk_brands');
  }

  public function Serie() {
    return $this->hasOne('Series','id', 'fk_series');
  }
}

```


## 10) app/routes.php

Aqui vamos mudar o jeito de chamar nossas rotas, vamos criar um arquivo ``routes.php`` que invacará as classes dos controllers. Fica mais organizado!

A forma do Slim invocar uma classe, em vez de chamar a função normal, é colocando o padrão ``$app->get("/url-da-rota", "NomeDaClasse:Metodo");``, sacou, nome da classe + dois pontos + o método.

```php
<?php

# Index
$app->get("/", "BaseController:index");

# Listagem
$app->get("/guitars", "GuitarController:guitars");

# Form Insert e Update
$app->get("/guitar/insert", "GuitarController:guitarFormInsert");
$app->get("/guitar/update/:id", "GuitarController:guitarFormUpdate");

# Ações CRUD
$app->post("/guitar", "GuitarController:guitarCreate");
$app->put("/guitar/:id", "GuitarController:guitarUpdate");
$app->delete("/guitar/:id", "GuitarController:guitarDelete");

```

## 11) app/controllers/baseControllers.php

Outra forma de organizar, é criar uma classe base, para que seja extendida para as demais classes controllers que você criar, pois quando precisar criar um método que seja compartilhado por todas as classes, coloque a mesma na classe ``baseController.php``!

Aqui já faço isso, instancio o Slim como ``$this->app``, e usarei no meu controller. Também aqui já coloquei a rota ``index``.

```php
<?php

use Slim\Slim as Slim;

class BaseController {

  public $app;

  function __construct() {
    $this->app = Slim::getInstance();
  }

  public function index() {

    $links = array(
      array('name' => 'Listagem de Guitarras', 'endpoint' => 'guitars' )
    );

    $this->app->view->setData('links',$links);
    $this->app->render("index.html");

  }
}

```

## 12) app/controllers/guitarControllers.php

Esse é o aquivo mais extenso, então vou comentar no código mesmo.

```php
<?php

# Instancia do Validate
use Illuminate\Support\Facades\Validator as Validator;

class GuitarController extends BaseController {

  # Listagem
  public function guitars() {

    $options = array(
      'title'  => 'Listagem de Guitarras',
      'insert' => 'Inserir nova Guitarra'
    );

    $items = Guitars::with('Brand')
                    ->with('Serie')
                    ->orderBy('updated_at','DESC')
                    ->get()
                    ->toArray();

    // é assim que você passa variáveis para o twig template, usando setData
    // dentro da view ele estará disponível como {{ items }} e {{ options }}
    $this->app->view->setData('items', $items);
    $this->app->view->setData('options', $options);

    return $this->app->render("guitars.html");

  }

  # lembre-se que para enviarmos POST, PUT e DELETE, precisamos ter um
  # input  name=_METHOD com o valor correspondente (ex: value=PUT), para que
  # seja entendido pelo framework.

  # Form Insert
  public function guitarFormInsert() {

    // flash messages são mensagens compartilhadas de uma rota para outra
    // aqui verifico se existe alguma flash message, se sim, seto na view
    $flash = $this->app->view()->getData('flash');
    if( isset($flash['post']) ) {
      $this->app->view->setData('item', $flash['post'] );
    }

    $options = array(
      'title'   => 'Nova Guitarra',
      'button'  => 'Salvar Guitarra',
      'action'  => 'guitar',
      'method'  => 'POST',
      '_method' => 'POST',
      'brands'  => Brands::all()->lists('id', 'description'),
      'series'  => Series::all()->lists('id', 'description')
    );

    $this->app->view->setData('options', $options);

    return $this->app->render("guitarForm.html");

  }

  # Form Update
  public function guitarFormUpdate( $id ) {

    $guitar = Guitars::find($id);
    if( !$guitar ) {
      $this->app->redirect( _BASEURL . 'guitars');
    }

    $this->app->view->setData('item', $guitar );

    $options = array(
      'title'   => 'Alterando a Guitarra ' . $id,
      'button'  => 'Alterar Guitarra',
      'action'  => 'guitar/' . $id,
      'method'  => 'POST',
      '_method' => 'PUT',
      'brands'  => Brands::all()->lists('id', 'description'),
      'series'  => Series::all()->lists('id', 'description')
    );

    $this->app->view->setData('options', $options);

    return $this->app->render("guitarForm.html");

  }

  # Validation: é coisa linda, você separa por pipe as regras ( pode usar array também )
  # principalmente quando precisa usar regex que possui pipe.
  # confira as regras no site do laravel framework http://laravel.com/docs/4.2/validation

  private function getGuitarValidationRules() {
    return array(
      'fk_brands'   => 'required|integer',
      'fk_series'   => 'required|integer',
      'description' => 'required|min:2|max:10|regex:/^([A-Za-z0-9 ]*)$/'
    );
  }

  # Validation: você pode criar mensagens custom para cada campo e tipo de validação
  # e esse ":attribute" é substituido pelo nome do campo.
  private function getGuitarValidationMessages() {
    return array(
      'fk_brands.required'   => 'required :attribute. Coloque uma Marca rapá!',
      'fk_series.required'   => 'required :attribute. Coloque uma Série mano!',
      'description.required' => 'required :attribute. Coloque o nome da guitarra!',
      'description.min'      => 'min :attribute. Ixi, tem pouca letra!',
      'description.max'      => 'max :attribute. Uau, tem muita letra!',
      'description.regex'    => 'regex :attribute. Opsss regex está errado véi!'
    );
  }

  # só para pegar os dados enviados pelo post
  private function getGuitarParams() {
    return array(
      'fk_brands'   => $this->app->request->params("fk_brands", false),
      'fk_series'   => $this->app->request->params("fk_series", false),
      'description' => $this->app->request->params("description", false)
    );
  }

  # Validation: Aqui a validação acontece, passe para o validator 3 coisas:
  # 1:dados post 2:regras 3:mensagens. O método ->fails() retorno true ou false.
  # Se deu false, você pega as mensagens de erros no método errors->getMessage()
  private function guitarValidationFails() {

    $post      = $this->getGuitarParams();
    $rules     = $this->getGuitarValidationRules();
    $messages  = $this->getGuitarValidationMessages();
    # Note que a lib slim-services já colocou no slim a instancia Validator.
    $validator = $this->app->validator->make( $post, $rules, $messages );

    return $validator->fails() ? $validator->errors()->getMessages() : false;

  }

  # super útil esse método, se passar um $id então é um Update, se não é Insert.
  private function saveOrUpdateGuitar( $id = false ) {

    if ( $id ) {
      $guitar = Guitars::find($id);
    } else {
      $guitar = new Guitars();
    }

    $post = $this->getGuitarParams();

    $guitar->fk_brands   = $post['fk_brands'];
    $guitar->fk_series   = $post['fk_series'];
    $guitar->description = $post['description'];

    $guitar->save();

    return true;

  }


  # method post to create
  public function guitarCreate() {

    $errors = $this->guitarValidationFails();

    if ( $errors  ) {
      # olha aqui setando os flash messages.
      $this->app->flash('message', 'Opppppa! Tem alguns erros na área!!!');
      $this->app->flash('errors', $errors );
      $this->app->flash('post', $this->getGuitarParams() );
      # redireciono de volta para o form com as mensagens de erros e os
      # dados preenchidos no form
      return $this->app->redirect(_BASEURL . "guitar/insert");

    } else {
      # aqui deu tudo certo, então faz insert e redireciona para listagem
      $this->saveOrUpdateGuitar();
      $this->app->flash('message', 'Oba! Salvou certinho!');
      return $this->app->redirect(_BASEURL . "guitars");

    }

  }

  # method put to update
  public function guitarUpdate( $id ) {

    # usamos mesmo metodo para validação
    $errors = $this->guitarValidationFails();

    if ( $errors  ) {
      # aqui devolvo além dos erros, os dados originais e não os preenchidos no form.
      $post = Guitars::find($id);
      $this->app->flash('message', 'Opppppa! Tem alguns erros na área!!!');
      $this->app->flash('errors', $errors );
      $this->app->flash('post', $post );

      return $this->app->redirect(_BASEURL . "guitar/update/{$id}");

    } else {
      # tudo certo, faz update e redireciona para listagem
      $this->saveOrUpdateGuitar( $id );
      $this->app->flash('message', 'Oba! Alterou certinho!');
      return $this->app->redirect(_BASEURL . "guitars");

    }

  }

  # method delete to remove
  public function guitarDelete( $id ) {

    $guitar = Guitars::find($id);
    $guitar->delete();
    $this->app->flash('message', 'Certo! Deletado !');
    return $this->app->redirect(_BASEURL . "guitars");

  }

}

```

## 13) app/views/shared/layout.html

Agora vamos para nossos arquivos ``Twig``. O Twig é meu template favorito, ele é muito rápido por cachear as páginas geradas na pasta ``views/cache``, então já sabe, você só cria ela e deixa que o Twig se encarrega de administrar.

Leia a [documentação do Twig](http://twig.sensiolabs.org/documentation), e verá que ele possui muitos métodos úteis e inteligêntes que te darão muita agilidade no desenvolvimento.

Esse é o aquivo principal, onde no block ``content`` será inserido o conteúdo do template chamado pelo controller, através de um ``extends``.

```twig
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Slim Framework + Twig Template + Illuminate Database/Validation</title>
  <link rel="stylesheet" href="{{public}}/css/main.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1><a href="{{baseUrl}}">Slim Framework + Twig Template + Illuminate Database/Validation</a></h1>
    </header>
    {% if flash['message'] %}
      <div class="alert">
        <p>{{flash['message']}}</p>
      </div>
    {% endif %}
    {% block content %}{% endblock %}
    <footer class="footer">
      <a href="http://slimframework.com/">Slim Framework</a> +
      <a href="http://twig.sensiolabs.org">Twig Template</a> +
      <a href="https://github.com/illuminate/database">Illuminate Database</a> +
      <a href="https://github.com/illuminate/validation">Illuminate Validation</a> ;)
    </footer>
  </div>
  <script src="{{public}}/js/app.js"></script>
</body>
</html>
```

## 14) app/views/index.html

```twig
{% extends 'shared/layout.html' %}
{% block content %}
<section class="section">
  <ul class="list">
    {% for link in links %}
    <li>
      <a href="{{baseUrl}}{{link.endpoint}}" class="button">
        <strong>{{link.name}}</strong>
      </a>
    </li>
    {% endfor %}
  </ul>
</section>
{% endblock %}
```

## 15) app/views/guitars.html
```twig
{% extends 'shared/layout.html' %}
{% block content %}
  <section class="section">
    <h2>{{options.title}}</h2>
    <ul class="list">
      <li>
        <a href="{{baseUrl}}guitar/insert" class="button">
          <strong>{{options.insert}}</strong>
        </a>
      </li>
    </ul>
    <table class="table">
      <thead>
        <tr>
          <th>Brand</th>
          <th>Serie</th>
          <th>Guitar</th>
          <th>Criado em</th>
          <th>Alterado em</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {% for i in items %}
        <tr>
          <td>
            {{i.brand.description}}
          </td>
          <td>
            {{i.serie.description}}
          </td>
          <td>{{i.description}}</td>
          <td>{{i.created_at|date("m/d/Y H:i:s")}}</td>
          <td>{{i.updated_at|date("m/d/Y H:i:s")}}</td>
          <td>
            <a href="{{baseUrl}}guitar/update/{{ i.id }}" class="button button-sm">Editar</a>
          </td>
          <td>
            <form action="{{baseUrl}}guitar/{{ i.id }}" method="POST" class="js-delete-form">
              <input type="hidden" name="_METHOD" value="DELETE">
              <div class="form-group">
                <button type="submit" class="button button-sm button-dl">Remover</button>
              </div>
            </form>
          </td>
        </tr>
        {% endfor %}
      </tbody>
    </table>
  </section>
{% endblock %}
```

## 16) app/views/guitarForm.html

Estou usando um único arquivo para o formulário de insert/update. Basta organizar!

```twig
{% extends 'shared/layout.html' %}
{% block content %}
  <section class="section">
    <h2>{{options.title}}</h2>
    <form action="{{baseUrl}}{{options.action}}" class="form" method="{{options.method}}">
      <input type="hidden" name="_METHOD" value="{{options._method}}">
      <div class="form-group {% if flash['errors']['fk_brands'] is defined%}has-error{% endif %}">
        <label for="fk_brands">Brand</label>
        <select name="fk_brands" id="fk_brands" class="form-control">
          <option value="">-</option>
          {% for key, value in options.brands %}
              {% if value == item.fk_brands %}
                {% set sel = "selected=selected" %}
              {% else %}
                {% set sel = "" %}
              {% endif %}
              <option value="{{value}}" {{sel}}>{{key}}</option>
          {% endfor %}
        </select>
        {% if flash['errors']['fk_brands'] is defined %}
        <span class="error">
          {{ flash['errors']['fk_brands']|join(' ') }}
        </span>
        {% endif %}
      </div>
      <div class="form-group {% if flash['errors']['fk_series'] is defined %}has-error{% endif %}">
        <label for="fk_series">Series</label>
        <select name="fk_series" id="fk_series" class="form-control">
          <option value="">-</option>
          {% for key, value in options.series %}
              {% if value == item.fk_series %}
                {% set sel = "selected=selected" %}
              {% else %}
                {% set sel = "" %}
              {% endif %}
              <option value="{{value}}" {{sel}}>{{key}}</option>
          {% endfor %}
        </select>
        {% if flash['errors']['fk_series'] is defined %}
        <span class="error">
          {{ flash['errors']['fk_series']|join(' ') }}
        </span>
        {% endif %}
      </div>
      <div class="form-group {% if flash['errors']['description'] is defined%}has-error{% endif %}">
        <label for="description">Descrição</label>
        <input type="text" name="description" id="description" class="form-control" value="{{item.description}}">
        {% if flash['errors']['description'] is defined%}
        <span class="error">
          {{ flash['errors']['description']|join('<br>')|raw }}
        </span>
        {% endif %}
      </div>
      <div class="form-group">
        <button class="button" type="submit">{{options.button}}</button>
      </div>
    </form>
  </section>
{% endblock %}
```


## 17) public/css/main.css

Vamos dar um estilo.

```css
html {
  text-align: center;
  font: 100%/1.5 'Arial', sans-serif;
  font-weight: 400;
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
}
*, *:before, *:after {
  padding: 0;
  margin: 0;
  -webkit-box-sizing: inherit;
     -moz-box-sizing: inherit;
          box-sizing: inherit;
}
body {
  background-color: #fcfcfc;
  color: #333;
}

a {
  color: #DE4F4F;
}
a:hover {
  color: #000;
}

h1 {
  padding: 10px;
  font-size: 1.3em;
}
h1 a {
  color: #fff;
  text-decoration: none;
}
h1 a:hover {
  color: #fce5e5;
}

h2 {
  font-size: 1.2em;
  text-transform: uppercase;
  font-weight: 700;
  color: #222;
}

.container {
  margin: 40px auto;
  max-width: 700px;
}

.header {
  background-color: #DE4F4F;
  border: solid 2px #DE4F4F;
  border-radius: 4px;
}

.section {

}

.list {
  margin: 0 auto;
  max-width: 300px;
}

.list li {
  margin: 10px 0;
  list-style: none;
}

.footer, .section {
  margin: 10px 0;
  padding: 10px;
  border: solid 2px #DE4F4F;
  border-radius: 4px;
  font-size: 0.9em;
  color: #999;
}

table {
  width: 100%;
  margin-bottom: 20px;
  max-width: 100%;
  background-color: transparent;
  border-collapse: collapse;
  border-spacing: 0;
}

table thead {
  text-align: left;
}
table thead > tr > th {
  padding: 20px 8px;
  color: #444;
  font-weight: 700;
  background: #f6f6f6;
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
}

table tbody > tr > td {
  text-align: left;
  padding: 14px 8px;
  line-height: 1.428571429;
  vertical-align: middle;
  border-top: 1px solid #f1f1f1;
  font-size: 0.8em;
}

table tbody > tr > td small {
  display: block;
  font-size: 0.8em;
  color: #999;
}

.form-group {
  margin: 0 auto;
  padding: 4px;
  max-width: 300px;
  margin-bottom: 4px;
  text-align: left;
}
.form-group label {
  margin: 0 0 4px;
  font-size: .9em;
  font-weight: 700;
  line-height: 1.7;
  color: #444;
  display: block;
}

.form-control {
  display: block;
  margin: 0 0 2px;
  padding: 0 0 0 10px;
  text-indent: 10px;
  width: 100%;
  height: 40px;
  font-size: 0.9em;
  line-height: 1.42857143;
  color: #444;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
  box-shadow: inset 1px 1px 2px rgba(0,0,0,0.05);
  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
  -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
}
.form-control:focus {
  border-color: #de4f4f;
}

select.form-control {
  text-indent: 0px;
  height: 40px;
}

.error {
  display: none;
  color: #fff;
  font-size: 0.8em;
  padding: 4px 12px;
  border-radius: 3px;
  border: 1px solid #8F3DBE;
  background: #8F3DBE;
  -webkit-transition: all ease-in-out .15s, all ease-in-out .15s;
     -moz-transition: all ease-in-out .15s, all ease-in-out .15s;
          transition: all ease-in-out .15s, all ease-in-out .15s;
  -webkit-transform: scale(0);
     -moz-transform: scale(0);
          transform: scale(0);
}

.has-error .error {
  display: inline-block;
  -webkit-transform: scale(1);
    -moz-transform: scale(1);
         transition: all ease-in-out .15s, all ease-in-out .15s;
}
.has-error .form-control {
  border-color: #8F3DBE!important;
}

.button {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  border: 2px solid #de4f4f;
  white-space: nowrap;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  border-radius: 4px;
  background: #FFF;
  color: #de4f4f;
  -webkit-transition: all 0.2s linear;
     -moz-transition: all 0.2s linear;
          transition: all 0.2s linear;
  text-decoration: none;
  width: 100%;
}

.button:hover,
.button:focus {
  border: 2px solid #de4f4f;
  background-color: #de4f4f;
  color: white;
}
.button:focus {
  outline: 0;
}

.button-sm {
  padding: 4px 6px;
  font-size: 12px;
  text-align: center;
}

.button-dl {
  text-align: center;
  background: #CC0000;
  color: #fff;
}

.alert {
  margin: 20px auto;
}
.alert p {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  color: #fff;
  background: #8F3DBE;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
```

## 18) public/js/app.js

Só um script para mostrar um confirm quando exluir.

```javascript
;(function() {

  'use strict';

  var app = App.prototype;

  function App(){
    this.init();
  };

  app.init = function () {
    var form = document.querySelectorAll('.js-delete-form');
    for (var prop in form) {
      if ( form.hasOwnProperty(prop) ) {
        if ( "onsubmit" in form[prop] ) {
          form[prop].onsubmit = this.onSubmit;
        }
      }
    }
  };

  app.onSubmit = function () {
    if ( confirm('Deseja mesmo excluir rapá ?') ) {
      return true;
    }
    return false;
  };

  document.addEventListener( 'DOMContentLoaded', new App(), false );

})();

```

Pronto!!!

Agora abra seu browser no endereço do seu APP, no meu caso é ``http://localhost/slim-rest/``.

Extenso né ? Sei disso, mas espero que sirva de ajuda ou auxílio para você.

Mais uma coisa, [clique aqui e veja o app funcionando](http://192.241.214.149/slim-rest/).

Obrigado por ler, e até o próximo post.

That's it!