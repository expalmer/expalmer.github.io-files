---
title: "Criando um Rest com Slim Framework e Illuminate Database em poucos minutos - parte 1"
titleFull: Criando um Rest com Slim Framework em poucos minutos - parte 1
description: "O Slim é um framework em PHP, ele é leve e muito útil, e nós usaremos o Illuminate Database que é um ORM inteligente."
keywords: "PHP, SlimFramework, Illuminate"
author: Palmer Oliveira
date: 2014-11-22T12:10:36.157Z
template: article.hbt
tags: php, slimframework
---

O [Slim Framework](http://slimframework.com/) é um framework em PHP que uso praticamente em todos meus projetos em PHP, ele é leve e muito útil.

E juntamente com o Slim, eu uso o [Illuminate Database](https://github.com/illuminate/database) que é um componente de ORM onde você não precisa gastar horas criando suas classes de banco de dados para consulta, relacionamento e tudo mais, ele abstrai toda essa parte.

Para ver o funcionamento do Slim, vamos criar uma API de cadastro de guitarras, só que neste post vamos primeiramente criar as rotas de leitura de nosso produto.

Nos posts seguintes, iremos criar o CRUD para deixar completo nosso Rest. Também veremos o funcionamento de um template engine e usaremos alguma lib javascript para fazer as ações no front-end.

## 1) Para começar criaremos os dados!

Crie 3 tabelas abaixo no MySql:
- **brands**: Marca da guitarra.
- **series**: Modelo da Guitarra.
- **guitars**: A guitarra em sí, ela terá 2 chaves estrangeiras para ( **brands** e **series**).

Alimente com esses dados:

```sql

# brands
INSERT INTO brands (id, description, created_at, updated_at) VALUES
  (1, 'Gibson', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Fender', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Epiphone', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'PRS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Ibanez', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Martin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Taylor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

# series
INSERT INTO series (id, description, created_at, updated_at) VALUES
  (1, 'Les Paul', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'SG', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'RD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Flying V', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Firebird', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Statocaster', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Telecaster', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 'Jaguar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 'Custom', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 'Retro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 'DX', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 'HD-28', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

# guitars
# informamos brand, serie e um nome para a guitarra
INSERT INTO guitars (id, fk_brands, fk_series, description, created_at, updated_at) VALUES
  (1, 1, 1, 'Standart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 2, 'Pro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 3, 'Studio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 2, 6, 'Standart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 2, 7, 'Pro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 2, 8, 'Studio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 3, 1, 'Standart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 3, 2, 'Pro', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 4, 9, 'Studio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 4, 9, 'Standart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

```

### 2 ) Estrutura de arquivos do APP
```javascript

slim-rest
├── app
│   ├── config
│   │   └── database.php
│   ├── controllers
│   │   └── appControllers.php
│   ├── helpers
│   │   └── appHelpers.php
│   ├── models
│   │   └── appModels.php
├── .htaccess
├── composer.json
└── index.php

```

Nós vamos instalar o Slim com o [Composer](https://getcomposer.org/), um gerenciador de dependências PHP. Se você não conhece ainda, essa é uma boa hora conhecer.

### 3) composer.json

```javascript
{
  "require": {
    "slim/slim": "2.4.3",
    "illuminate/database": "v4.2.9"
  }
}
```
Vamos comentar as dependências.
- **slim/slim**: Nosso framework.
- **illuminate/database**: Nosso ORM.

## 4) Instalando as Dependências com Composer.

Crie o diretório do nosso projeto que chamamos de ``slim-rest`` e dentro dela baixe o ``composer`` com o comando abaixo:

```bash
$ curl -sS https://getcomposer.org/installer | php
```

Esse comando vai baixar um arquivo chamado ``composer.phar``, pois ele que vai fazer o trabalho de instalar suas dependências.

Ainda na raiz do diretório ``slim-rest``, dê o comando para instalar as dependências.

```bash
$ php composer.phar install
```
O composer vai criar um diretório chamado ``vendor`` contendo todas as suas dependências.

Agora que baixou as dependências, vamos criar nossos arquivos.

## 5) index.php

Esse é nosso arquivo principal de entrada do APP.

```php
<?php

# === constants
# ==================================================
define("_APP", dirname(__FILE__) . '/app');

# === slim
# ==================================================
require 'vendor/autoload.php';
$app = new \Slim\Slim(array(
  'debug' => true
));

# === config
# ==================================================
require_once _APP . '/config/database.php';

# === helpers
# ==================================================
require_once _APP . '/helpers/appHelpers.php';

# === models
# ==================================================
require_once _APP . "/models/appModels.php";

# === controllers
# ==================================================
require_once _APP . "/controllers/appControllers.php";

# === run slim
$app->run();
```

## 6) .htaccess

```bash
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [QSA,L]
```

## 7) app/config/database.php

```php

<?php
// Database configuration
$settings = array(
  'driver'    => 'mysql',
  'host'      => 'localhost',
  'database'  => 'database',
  'username'  => 'user',
  'password'  => 'password',
  'charset'   => 'utf8',
  'collation' => 'utf8_unicode_ci',
  'prefix'    => ''
);

use Illuminate\Database\Capsule\Manager as Capsule;
$capsule = new Capsule;
$capsule->addConnection( $settings );
$capsule->bootEloquent();

```

## 8) app/helpers/appHelpers.php

Aqui criei um helper para dar output em json.

```php
<?php
use Slim\Slim;

class helpers {

  static function jsonResponse( $error = true, $message = '', $data = array() ) {

    $app               = Slim::getInstance();
    $response          = new stdClass();
    $response->error   = $error;
    $response->message = $message;
    $response->data    = $data;

    $app->response()->header('Content-Type', 'application/json');
    return $app->response()->body( json_encode($response) );

  }

}
```

## 9) app/models/appModels.php

Aqui é onde o **Illuminate** reconhece nossas classes de Model, apenas crie uma classe com extends nele, informe o nome da tabela e pronto. Cara, ele é muito útil e possui muitos outros recursos que fará você ganhar tempo em seus projetos.

Para saber como usar mais recursos do  **Illuminate**, olhe a documentação no [site do Laravel](http://laravel.com/docs/4.2/eloquent), pois ele usa esse component também.

```php
<?php

class Brands extends Illuminate\Database\Eloquent\Model
{
  protected $table = 'brands';
}

class Series extends Illuminate\Database\Eloquent\Model
{
  protected $table = 'series';
}

class Guitars extends Illuminate\Database\Eloquent\Model
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

## 10) app/controllers/appControllers.php

```php
<?php

# === api
# ==================================================
$app->get('/api/v1/brands', function() use ($app) {

  $results = Brands::all();
  return helpers::jsonResponse(false, 'results', $results );

});

$app->get('/api/v1/series', function() use ($app) {

  $results = Series::all();
  return helpers::jsonResponse(false, 'results', $results );

});

$app->get('/api/v1/guitars', function() use ($app) {

  $results = [];
  $description = $app->request->get('description');
  if ( $description ) {
    $results = Guitars::with('Brand')
                      ->with('Serie')
                      ->where('description','LIKE',"%{$description}%")
                      ->get();
  } else {
    $results = Guitars::with('Brand')
                      ->with('Serie')
                      ->get();
  }
  $message = $results->count() . ' results';
  return helpers::jsonResponse(false, $message, $results );

});

```

Pronto!!!

Agora abra seu browser no endereço do seu APP, no meu caso é ``http://localhost/slim-rest/``, então as rotas ficaram assim:

- ``http://localhost/slim-rest/api/v1/brands``: As marcas.
- ``http://localhost/slim-rest/api/v1/series``: Os modelos.
- ``http://localhost/slim-rest/api/v1/guitars``: As guitarras com sua respectiva marca e modelo.

Temos também uma pequena busca no campo ``description`` na rota guitars, testa assim: ``http://localhost/slim-rest/api/v1/guitars?description=a``.


Então isso é só o começo, podemos criar muitas coisas em cima disso.

Não expliquei detalhadamente cada arquivo, mas se você tiver alguma dúvida pode me perguntar que terei o prazer em ajuda-lo. Caso tenha alguma dica de melhoria, será bem vinda!

Concluindo, o ``Slim`` é muito bacana pois em minutos você levanta uma aplicação bem organizada, rápida e segura. Note que usamos o ``Illuminate`` para pegar os dados do banco, inclusive com join e outras tabelas, e tudo isso de uma forma simples.

Com pouco código já temos nosso Rest definido!

Obrigado por ler, e até o próximo post.

That's it!



















