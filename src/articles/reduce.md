---
title: "Criando seu proprio Array Reduce em Javascript"
titleFull: Criando seu proprio Array Reduce em Javascript
description: "Aprendendo programação funcional criando um reduce em javascript."
keywords: "javascript"
author: Palmer Oliveira
date: 2015-12-21T18:00:06.157Z
layout: article.html
tags: javascript
---

Reduce é uma função simples, porém muito poderosa, e se você tiver criatividade poderá fazer coisas incríveis com ela.

## Reduce ?

É um padrão onde você percorre uma coleção e faz reduções na mesma. Simples assim.

No reduce você passa uma função que será executada a cada item ( como o ``map`` ), mas com o detalhe de que sua função será executada com 4 argumentos:

- 1 - **Acumulador**: O 1º item do array, ou um valor inicial (2º parâmetro do reduce)
- 2 - **Item Atual**: 2º item ou o 1º se houver valor inicial
- 3 - **Indice**: Indice atual
- 4 - **Array**: Array inteiro

Ou seja, na primeira execução de cara você já recebe o primeiro e o segundo item de sua coleção, o que você retornar será o acumulador na próxima chamada. Também é possível passar um segundo argumento no reduce, caso queira um valor inicial, e com isso é possível fazer muitas coisas.

Para melhor entendimento, dê uma olhada na [documentação da Mozzila](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce).

Vamos já criar nosso próprio ``reduce``, e na sequencia já temos alguns exemplos onde ficará mais claro do que estamos falando.

## reduce

```javascript
Array.prototype.reduce = function(callback, initialValue) {
  var len = this.length;
  var index = 1; // index começa em 1
  var accumulatedValue = this[0]; // valor acumulado é o 1o valor
  // se for passado valor inicial, mudamos as coisas
  if ( initialValue ) {
    index = 0; // começa em 0
    accumulatedValue = initialValue; // acumulado = valor inicial
  }
  while(index < len) {
    accumulatedValue = callback(accumulatedValue, this[index], index, this );
    index++;
  }
  return accumulatedValue;
};
```

## Exemplos Práticos

Vou usar sempre as variáveis com nomes ``acc`` de accumulator (acumulador), e ``curr`` de currentValue (valor atual ou valor corrente).

### Somando

Somamos todos os items de uma array.

```javascript
var total = [1,2,3,4,5,6,7,8]
  .reduce(function( acc, curr ) {
    return acc + curr;
  });

console.log(total);
// 36
```

### Multiplicando

Multiplicamos todos os items de uma array.

```javascript
var total = [1,2,3,4]
  .reduce(function( acc, curr ) {
    return acc * curr;
  });

console.log(total);
// 24
```

### Maior e Menor valor

Agora algo mais interessante, quem é o maior valor no array?

```javascript
var maior = [1,2,99,4,5]
  .reduce(function( acc, curr ) {
    return acc > curr ? acc : curr;
  });

console.log(maior);
// 99
```
Para verificar o menor valor, troque o operador para ``<``.

### AND e OR

Vamos criar uma função ``AND``, que verifica se dentro do array todos os valores são verdadeiros, ou seja, sejam diferentes de ``""``, ``0``, ``undefined`` e ``false``. Perceba que passo um valor inicial para __reduce__ contendo ``true``.

```javascript
var ok = [1,2,3,4,'ola',true]
  .reduce(function( acc, curr ) {
    return !!(acc && curr);
  }, true);

console.log(ok);
// true

var ops = [1,2,3,null,'ola']
  .reduce(function( acc, curr ) {
    return !!(acc && curr);
  }, true);

console.log(ops);
// false. pois tem um null

```

Vamos criar agora o ``OR``, dessa vez passo o valor inicial de ``false`` para fazer a verificação. Se houver qualquer valor verdadeiro no array, retorna ``true``.

```javascript
var ok = [false,'',null,'Ola']
  .reduce(function( acc, curr ) {
    return !!(acc || curr);
  }, false);

console.log(ok);
// true

var ops = [false,'',null,'']
  .reduce(function( acc, curr ) {
    return !!(acc || curr);
  }, false);

console.log(ops);
// false. pois não tem nenhum valor verdadeiro

```
### Inverter um array

Claro que você vai preferir usar a função ``reverse``, mas saca só que interessante usar __reduce__ para isso.

```javascript
var rev = ['s','t','a','r','','w','a','r','s']
  .reduce(function( acc, curr, index ) {
    return [curr].concat(acc);
  },[]);

console.log(rev);
// [ 's', 'r', 'a', 'w', '', 'r', 'a', 't', 's' ]
```

Mas eu te digo, você vai precisar fazer algo do tipo um dia!

### Inverter um array com condição

O que acha de inverter o array, mas somente os items que forem consoantes?

```javascript

var cons = ['s','t','a','r','','w','a','r','s']
  .reduce(function( acc, curr, index ) {
    return curr.match(/[^aeiou]/) ? [curr].concat(acc) : acc;
  },[]);

console.log(cons);
// [ 's', 'r', 'w', 'r', 't', 's' ]
```
### Exemplo com objetos

Vamos usar nossos dados __lordOfTheRings__ para fazer mais alguns exemplos.

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

### Maior número de caracteres nas Weapons

Eu quero que retorne apenas o nome de quem tem o maior número de caracteres em suas __weapons__, olha que interessante:


```javascript
var name = lordOfTheRings
  .reduce(function( a, b, index, array) {
    var acc = a.weapons.join('').length > b.weapons.join('').length ? a : b;
    if( array.length -1 === index ) {
      acc = acc.name;
    }
    return acc;
  })

console.log(name);
// Sauron

```
Note que faço um __if__ para verificar o último item do laço, para transformá-lo em uma única string.

### Agrupar por raça

Agora um exemplo mais complexo, onde quero agrupar os nomes por raça:

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
var byRace = lordOfTheRings
  .reduce(function( acc, curr) {
    acc[curr.race] = acc[curr.race] || [];
    acc[curr.race].push(curr.name);
    return acc;
  },{});

console.log(byRace);
/*
{
 Elves: [ 'Galadriel', 'Legolas' ],
 Maiar: [ 'Gandalf', 'Radagast' ],
 Men: [ 'Aragorn', 'Faramir' ],
 Ainur: [ 'Sauron' ]
}
*/
```

## Implementações


Reduce é sem dúvida uma das funções que mais gosto de usar, pois com ela podemos fazer muitas coisas, inclusive implementar nossas funções arrays:


### forEach

```javascript
Array.prototype.forEach = function(callback) {
  return this.reduce( function( acc, x ) {
    callback(x);
    return x;
  },null);
};
```

### map

```javascript
Array.prototype.map = function( callback ) {
 return this.reduce( function( acc, x ) {
    return acc.concat( callback(x) );
  },[]);
};
```

### filter

```javascript
Array.prototype.filter = function(callback) {
  return this.reduce( function( acc, x ) {
    return callback(x) ? acc.concat( x ) : acc;
  },[]);
};
```

## Concluindo

Eu particularmente tenho usado reduce em vários projetos, pode até não parecer, mas você pode usar reduce em praticamente tudo.

Aprendemos mais uma função útil, logo iremos usar todas elas juntas, encadeando funções onde a coisa se torna super interessante.

No próximo post vamos implementar o __mergeAll__ e ver para que ele serve.

Espero que tenham gostado. That's it !