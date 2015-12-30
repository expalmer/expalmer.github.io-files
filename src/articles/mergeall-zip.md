---
title: "Criando seu proprio Array MergeAll e Zip em Javascript"
titleFull: Criando seu próprio Array MergeAll e Zip em Javascript
description: "Aprendendo programação funcional criando funções auxiliares mergeAll e zip em javascript."
keywords: "javascript"
author: Palmer Oliveira
date: 2015-12-28T19:00:06.157Z
layout: article.html
tags: javascript
---

Neste post criaremos duas funções auxiliares chamadas de ``mergeAll`` e ``zip``. Com elas teremos mais opções ao usar funções encadeadas junto com **map**, **filter** e **reduce**.

## Para que serve o mergeAll ?

Essa função serve para juntar um array multidimencional, ou seja, um array que contém outro array em cada um de seus itens. Por exemplo se temos um array assim ``[ [1,2,3], [4,5,6], [7,8,9] ]``, e para que ele fique assim ``[1,2,3,4,5,6,7,8,9]``, precisamos juntá-los.

## mergeAll

```javascript
Array.prototype.mergeAll = function() {
	var results = [];
	this.forEach(function(subArray) {
		subArray.forEach(function( x ) {
			results.push( x );
		});
	});
	return results;
};
```
Aqui pegamos os resultados usando nosso anteriormente criado [``forEach``][post1], e iteramos cada um dos itens cancatenando-os, e no final temos um único array.

### Pegando apenas os nomes

Vamos usar esses dados de exemplo.

```javascript
var lordOfTheRings = [
  {
    race: 'Elves',
    characters: [
      {
        name: "Galadriel",
        weapons: [ "Elven Magic", "Nenya" ]
      },
      {
        name: "Legolas",
        weapons: [ "Bow", "Knife" ]
      }
    ]
  },
  {
    race: 'Maiar',
    characters: [
      {
        name: "Gandalf",
        weapons: [ "Glamdring", "Wizard Staff", "Sword" ]
      },
      {
        name: "Radagast",
        weapons: [ "Powers of the Maiar", "Wizard Staff" ]
      }
    ]
  },
  {
    race: 'Men',
    characters: [
      {
        name: "Aragorn",
        weapons: [ "Anduril", "Sword" ]
      },
      {
        name: "Faramir",
        weapons: [ "Bow", "Sword" ]
      }
    ]
  },
  {
    race: "Ainur",
    characters: [
      {
        name: "Sauron",
        weapons: [ "One Ring", "Sword", "Powers of the Maiar" ]
      }
    ]
  }
];

```

O que preciso é criar um array com todos os nomes de cada um dos personagens que estão separados por raça.

Vamos primeiramente fazer assim:

```javascript
var names = lordOfTheRings
  .map(function(item){
    return item.characters
      .map(function( character ) {
        return character.name;
      });
  });

console.log(names);
/*
[ 
  [ 'Galadriel', 'Legolas' ],
  [ 'Gandalf', 'Radagast' ],
  [ 'Aragorn', 'Faramir' ],
  [ 'Sauron' ] 
]
*/
```

Note que temos 4 arrays dentro de um array... então usamos o ``mergeAll``.

```javascript
var names = lordOfTheRings
  .map(function(item){
    return item.characters
      .map(function( character ) {
        return character.name;
      });
  }).mergeAll();

console.log(names);
/*
[ 'Galadriel',
  'Legolas',
  'Gandalf',
  'Radagast',
  'Aragorn',
  'Faramir',
  'Sauron' ]
*/
```

No final de nosso **map**, chamamos a função **mergeAll**, e agora sim temos um único array :)


## Para que serve o zip ?

Essa função serve para iterar dois arrays ao mesmo tempo, aplicando uma função callback para ambos. Isso é útil quando temos dois arrays que possuem alguma ligação em relação aos seus indíces.

## zip

```javascript
Array.zip = function(left, right, callback) {
  var len = Math.min(left.length, right.length); // pegamos o menor tamanho
  var results = [];
  for( var i = 0; i < len; i++ ) {
    results.push( callback(left[i], right[i]) );
  }
  return results;
};
```

O que fazemos aqui é receber 3 argumentos, **(1)** o primeiro array, **(2)** o segundo array e **(3)** a função callback que vai iterar um por um dos itens dos array.

Note que se os arrays forem de tamanhos diferentes, ele irá pegar o tamanho do array menor. E também que essa função não vai no prototype, pois passamos duas referências de objetos/arrays diferentes.

### Ligando dois arrays 

Imagine esse cenário, onde no primeiro array, tenho os personagens e no segundo tenho as armas. O que eu preciso, é um novo objeto que pegue do primeito array apenas o ``name``, e pegue do segundo array apenas a último item de ``weapons``.

```javascript
var characters = [
  { name: "Galadriel" },
  { name: "Legolas" },
  { name: "Gandalf" },
  { name: "Radagast" },
  { name: "Aragorn" },
  { name: "Faramir" },
  { name: "Sauron" }
];

var weapons = [
  [ "Elven Magic", "Nenya" ],
  [ "Bow", "Knife" ],
  [ "Glamdring", "Wizard Staff", "Sword" ],
  [ "Powers of the Maiar", "Wizard Staff" ],
  [ "Anduril", "Sword" ],
  [ "Bow", "Sword" ],
  [ "One Ring", "Sword", "Powers of the Maiar" ]
];

var joined = Array.zip( characters, weapons, function( character, weapons ) {
  return { name: character.name, weapon: weapons.pop() };
});

console.log(joined);

/*
[ 
  { name: 'Galadriel', weapon: 'Nenya' },
  { name: 'Legolas', weapon: 'Knife' },
  { name: 'Gandalf', weapon: 'Sword' },
  { name: 'Radagast', weapon: 'Wizard Staff' },
  { name: 'Aragorn', weapon: 'Sword' },
  { name: 'Faramir', weapon: 'Sword' },
  { name: 'Sauron', weapon: 'Powers of the Maiar' } 
]
*/
```

Pronto, agora temos um único objeto.

Agora que temos todas as funções 	que precisamos, [map][post1], [filter][post1], [reduce][post2], [mergeAll][post3] e [zip][post3], nos próximos posts veremos como usá-las juntas para criarmos consultas interessantes e super úteis.

Espero que tenham gostado. That's it !

[post1]: http://expalmer.github.io/criando-seu-proprio-array-foreach-array-map-e-array-filter-em-javascript/
[post2]: http://expalmer.github.io/criando-seu-proprio-array-reduce-em-javascript/
[post3]: http://expalmer.github.io/criando-seu-proprio-array-mergeall-e-zip-em-javascript/





 





