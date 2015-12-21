---
title: "Criando seu proprio Array Foreach, Array Map e Array Filter em Javascript"
titleFull: Criando seu próprio Array Foreach, Array Map e Array Filter em Javascript
description: "Aprendendo programação funcional fazendo um foreach, map e filter em javascript."
keywords: "javascript"
author: Palmer Oliveira
date: 2015-08-11T05:13:06.157Z
layout: article.html
tags: javascript
---

Vou postar uma série de __Criando seu próprio alguma coisa__ em javascript para deixar registrado meus estudos e espero que sirva de ajuda para você.

## Estudando Programação Funcional em Javascript

Javascript é uma linguagem considerada **Híbrida**, pois é possível aplicar paradigmas de programação tais como [Imperativa](https://pt.wikipedia.org/wiki/Programa%C3%A7%C3%A3o_imperativa), [Declarativa](https://pt.wikipedia.org/wiki/Programa%C3%A7%C3%A3o_declarativa) e [Funcional](https://pt.wikipedia.org/wiki/Programa%C3%A7%C3%A3o_funcional).

No caso tenho estudado **Programação Funcional** e com isso aprendi que dominando funções como ``map``, ``filter``, ``reduce``, ``mergeAll`` e ``zip``, fará você ter super poderes.

Nas palavras de [Jafar Husain](https://github.com/jhusain) da NetFlix: _"Se você aprender essas 5 funções, seu código vai se tornar menor, mais auto descritivo e mais durável"_.

Vamos começar a aprender esses truques. Neste posts vamos ver **map** e **filter**, mas vou incluir o **forEach** antes de tudo:

### Considere esse array de objetos

```javascript
var lordOfTheRings = [
  { name: "Galadriel", race: "Elves", weapons: [ "Elven Magic", "Nenya" ] },
  { name: "Legolas",   race: "Elves", weapons: [ "Bow", "Knife" ] },
  { name: "Gandalf",   race: "Maiar", weapons: [ "Glamdring", "Wizard Staff", "Sword" ] },
  { name: "Radagast",  race: "Maiar", weapons: [ "Powers of the Maiar", "Wizard Staff" ] },
  { name: "Aragorn",   race: "Men",   weapons: [ "Anduril", "Sword" ] },
  { name: "Sauron",    race: "Ainur", weapons: [ "One Ring", "Sword", "Powers of the Maiar" ] },
  { name: "Faramir",   race: "Men",   weapons: [ "Bow", "Sword" ] }
];
```

Você precisa mostrar apenas o **name** e a **race** de cada personagem, então vamos usar um ``for``.

```javascript
var results = [];
var len = lordOfTheRings.length;
for (var i = 0; i < len; i++) {
  results.push( { name: lordOfTheRings[i].name, race: lordOfTheRings[i].race } );
}
console.log( results );
/*
[ { name: 'Galadriel', race: 'Elves' },
  { name: 'Legolas', race: 'Elves' },
  { name: 'Gandalf', race: 'Maiar' },
  { name: 'Radagast', race: 'Maiar' },
  { name: 'Aragorn', race: 'Men' },
  { name: 'Sauron', race: 'Ainur' },
  { name: 'Faramir', race: 'Men' } ]
*/
```


Vamos implementar nosso próprio ``forEach``.

## forEach
```javascript
// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// Para cada item do array é chamado o callback com 3 argumentos
// 1: O this[ i ], 2: o index atual, 3: o array inteiro
Array.prototype.forEach = function ( callback ) {
  var len = this.length; // tamanho do nosso array
  for( var i = 0; i < len; i++ ) {
    callback( this[i], i, this );
  }
};
```

**OBS:** Falar sobre ``prototype`` é coisa para outro post, embora tenham muitos outros posts pela internet explicando. Mas vamos a parte que nos interessa. Quando colocamos no prototype do objeto **Array** a função **forEach**, isso fará com que todos arrays tenham acesso a essa função. Note que o **this** é o próprio array.

Vamos usar nossa implementação.

```javascript
var results = [];
lordOfTheRings.forEach( function( item ) {
  results.push( { name: item.name, race: item.race } );
});
console.log( results );

/*
[ { name: 'Galadriel', race: 'Elves' },
  { name: 'Legolas', race: 'Elves' },
  { name: 'Gandalf', race: 'Maiar' },
  { name: 'Radagast', race: 'Maiar' },
  { name: 'Aragorn', race: 'Men' },
  { name: 'Sauron', race: 'Ainur' },
  { name: 'Faramir', race: 'Men' } ]
*/

// Só para você testar usando as chaves ;)
lordOfTheRings.forEach( function( item, index ) {
  console.log( index, item.name  );
});
/*
  0 '=>' 'Galadriel'
  1 '=>' 'Legolas'
  2 '=>' 'Gandalf'
  3 '=>' 'Radagast'
  4 '=>' 'Aragorn'
  5 '=>' 'Sauron'
  6 '=>' 'Faramir'
*/
```

Olha aí cara!! Você mesmo implementou seu próprio forEach, vamos adiante!

Imagine que agora você precise de um novo array de objetos apenas contendo  __name__ e __weapons__.
Com **forEach** faríamos assim:

```javascript
 var result = [];
 lordOfTheRings.forEach( function( item ) {
    result.push( { name: item.name, weapons: item.weapons } );
 });
 console.log(result);
/*
[ { name: 'Galadriel', weapons: [ 'Elven Magic', 'Nenya' ] },
  { name: 'Legolas', weapons: [ 'Bow', 'Knife' ] },
  { name: 'Gandalf', weapons: [ 'Glamdring', 'Wizard Staff', 'Sword' ] },
  { name: 'Radagast', weapons: [ 'Powers of the Maiar', 'Wizard Staff' ] },
  { name: 'Aragorn', weapons: [ 'Anduril', 'Sword' ] },
  { name: 'Sauron', weapons: [ 'One Ring', 'Sword', 'Powers of the Maiar' ] },
  { name: 'Faramir', weapons: [ 'Bow', 'Sword' ] } ]
*/
```

## map

Agora sim, vamos criar nosso array **map**, que irá retornar um novo array conforme nossa necessidade. Essa função é extremamente útil, pois com ela futuramente você verá como podemos encadear funções.

```javascript
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// Mesmo coisa que o forEach, mas guardamos os dados para retornar após o "for"
Array.prototype.map = function( callback ) {
  var results = [];
  var len = this.length;
  for( var i = 0; i < len; i++ ) {
    results.push( callback( this[i], i, this ) );
  }
  return results; // <= retornamos aqui
}
```

Agora usando nosso __map__.

```javascript
var result = lordOfTheRings.map( function ( item ) {
  return { name: item.name, weapons: item.weapons };
});
console.log( result );
/*
[ { name: 'Galadriel', weapons: [ 'Elven Magic', 'Nenya' ] },
  { name: 'Legolas', weapons: [ 'Bow', 'Knife' ] },
  { name: 'Gandalf', weapons: [ 'Glamdring', 'Wizard Staff', 'Sword' ] },
  { name: 'Radagast', weapons: [ 'Powers of the Maiar', 'Wizard Staff' ] },
  { name: 'Aragorn', weapons: [ 'Anduril', 'Sword' ] },
  { name: 'Sauron', weapons: [ 'One Ring', 'Sword', 'Powers of the Maiar' ] },
  { name: 'Faramir', weapons: [ 'Bow', 'Sword' ] } ]
*/
```

Até aqui tudo bem ? Viu que o __map__ retorna um novo array! Seguindo em frente vamos para exemplos mais interessantes.

Agora queremos listar apenas os **Elfos**!
Para isso teremos que usar um __forEach__, fazer um __if__ e guardar os resultados que queremos:

```javascript
var elfos = [];
lordOfTheRings.forEach( function ( item ) {
  if( item.race === "Elves" ) {
    elfos.push( { name: item.name, race: item.race } );
  }
});
console.log( elfos );
/*
  [ { name: 'Galadriel', race: 'Elves' },
    { name: 'Legolas', race: 'Elves' } ]
*/
```

Vamos criar nossa função __filter__, ela será responsável de filtrar os dados que desejamos. O que ela faz é percorrer cada item do array e se o retorno for __verdadeiro__ o item é acumulado.

## filter
```javascript
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
Array.prototype.filter = function ( callback ) {
  var results = [];
  var len = this.length;
  for( var i = 0; i < len; i++ ) {
    if ( callback( this[i] ) ) { // se for verdadeiro é acumulado
      results.push( this[i] );
    }
  }
  return results;
};
```

Aqui já entramos nas utilidades de encadear funções, vamos refazer nosso exemplo com __filter__ e __map__.

```javascript
var elfos = lordOfTheRings
              .filter( function ( item ) {
                return item.race === "Elves";
              })
              .map( function( elfos ) {
                return { name: elfos.name, race: elfos.race };
              });
console.log( elfos );

/*
  [ { name: 'Galadriel', race: 'Elves' },
    { name: 'Legolas', race: 'Elves' } ]
*/
```

Vamos fazer mais uns testezinhos com __map__ e __filter__ para fixar bem na mente.

```javascript
var numbers = [ 1,2,3,4,5,6,7,8,9 ];
// mostrandos só os numeros pares
var even = numbers.filter( function( n ) {
  return n % 2 === 0; //
});
console.log(even);
/*
  [ 2, 4, 6, 8 ]
*/

// pegue os numeros impares e multiplique por 10
var odd = numbers
            .filter( function( n ) {
              return n % 2; //
            })
            .map( function( n ) {
              return n * 100;
            })
console.log(odd);
/*
  [ 100, 300, 500, 700, 900 ]
*/
```

Até aqui já dá para perceber a variedade de coisas que podemos fazer apenas com ``map`` e ``filter``. E o melhor de tudo é que você mesmo criou cada uma dessas funções :).

## Finalizando

Para finalizar, vamos fazer mais um exemplo, e logo abaixo coloco 2 desafios para você.

```javascript
// Só quero quem é Maiar ou Men, e a quantidade total de weapons de cada um.
// Retorne um array de objetos somente com as chaves {name},{totalWeapons}
var result =  lordOfTheRings
                .filter( function( item ) {
                  return item.race === "Maiar" || item.race === "Men";
                })
                .map( function( item ) {
                  return { name: item.name, totalWeapons: item.weapons.length };
                });
console.log(result);

/*
  [ { name: 'Gandalf', totalWeapons: 3 },
    { name: 'Radagast', totalWeapons: 2 },
    { name: 'Aragorn', totalWeapons: 2 },
    { name: 'Faramir', totalWeapons: 2 } ]
*/
```

## Desafio 1

Me retorne todos ( menos o Sauron ) que possuam a quantidade total de armas maior que 2.

O array de objetos deve ser neste formato:
```javascript
/*
  [ { name: 'Name', totalWeapons: 0 }  ]
*/
```

## Desafio 2

Me retorne somente aqueles que possuam mais de 2 armas e entre elas deve conter uma "Sword".

Só use ``map`` e ``filter``, não pode usar ``if``.

O array de objetos deve ser neste formato:
```javascript
/*
  [ { name: 'Name', race: "Race", totalWeapons: 0 } ]
*/
```

Poste nos comentários as soluções dos desafios.

No próximo post vamos implementar o __reduce__.

Espero que tenham gostado. That's it !