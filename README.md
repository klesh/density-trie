Density Trie
============
A trie tree implementation, provide add/remove/lookup and density calcuation over specified text. Eastern/Western languages are supported

Requirement
===========
Node v4.0+

Installation
============

```base
npm install density-trie --save
```

Usage
=====

```js
var Trie = require('density-trie');
var should = require('should');

describe('Demo', function() {
  var western = true;
  var trie = new Trie(western);

  trie.add('He');
  trie.add('Hell');
  trie.add('Hello');

  console.log(trie.dump());

  var text = 'here is a fragment of text with "Hello World" in it, total number of "Hello" should be 2,  total number of "Hell" should be 1, "eHell" or eHello should not be counted';

  trie.density(text).should.be.deepEqual({
    Hello: 2, 
    World: 1,
    Hell: 1
  });

  should(trie.remove('Hello').lookup('Hello')).not.be.ok();

  trie.check('iteration stop when any keyword is hit like "Hello", the rest will not be examined').should.be.ok();
  trie.replace('replace keyword Hello with asterisks').be.exactly('replace keyword ***** with asterisks');
});
```
