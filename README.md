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

  var text = 'here is a fragment of text with "Hello World", "Hello" should be 2, "Hell" should be 1, no matter if "eHell" or eHello presented';

  trie.density(text).should.be.deepEqual({
    Hello: 2, 
    World: 1,
    Hell: 1
  });

  should(trie.remove('Hello').lookup('Hello')).not.be.ok();

  trie.check('check method will return immediately when any keyword is found, like Hello').should.be.ok();
  trie.replace('replace KEYWORD with *******').be.exactly('replace ******* with *******');
});
```
