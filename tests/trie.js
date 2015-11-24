var should = require('should');
var Trie = require('../index.js');

describe('Trie basic functionalities', function() {
  it('Trie.prototype.add', function() {
    var trie = new Trie();
    trie.add('H').root.size.should.be.exactly(1);
    trie.root.get('H').should.be.exactly(0);
    trie.add('He').root.size.should.be.exactly(1);
    trie.root.get('H').size.should.be.exactly(2);
    trie.root.get('H').get(Trie.OPEN_END).should.be.true();
    trie.root.get('H').get('e').should.be.exactly(Trie.DEAD_END);

  });

  it('Trie.prototype.lookup', function() {
    var trie = new Trie();
    trie.add('He');

    should(trie.lookup('Hell')).not.be.ok();

    trie.add('Hell');
    trie.add('Hello');

    should(trie.lookup('World')).not.be.ok();

    should(trie.lookup('H')).not.be.ok();
    should(trie.lookup('World')).not.be.ok();
    should(trie.lookup('He')).be.ok();
    should(trie.lookup('Hell')).be.ok();
  });

  it('Trie.prototype.remove', function() {
    var trie = new Trie();
    trie.add('He');
    trie.add('Hell');
    trie.add('Hello');
    
    should(trie.remove('Hell').lookup('Hell')).not.be.ok();
    should(trie.lookup('He')).be.ok();
    should(trie.lookup('Hello')).be.ok();

    trie.remove('Hello');
    should(trie.lookup('Hello')).not.be.ok();
    should(trie.lookup('He')).be.ok();
    should(trie.root.get('H').get('e')).be.exactly(Trie.DEAD_END);

    trie.remove('He');
    trie.root.size.should.be.exactly(0);
  });

  it('Trie.prototype.density in Symbolic Language', function() {
    var trie = new Trie(true);
    trie.add('Hello');
    trie.add('World');
    trie.add('Hell');

    trie.density('here is a fragment of text').should.be.empty();

    var text = 'here is a fragment of text with "Hello"';
    trie.density(text).should.be.deepEqual({ Hello: 1 });

    text = 'here is a fragment of text with "Hello World"';
    trie.density(text).should.be.deepEqual({
      Hello: 1, 
      World: 1 
    });

    text = 'here is a fragment of text with "Hello World" and "Hello" should be 2';
    trie.density(text).should.be.deepEqual({
      Hello: 2, 
      World: 1 
    });

    text = 'here is a fragment of text with "Hello World" and "Hello" should be 2, "Hell" should be 1, no matter if "eHell" or eHello presented';
    trie.density(text).should.be.deepEqual({
      Hello: 2, 
      World: 1,
      Hell: 1
    });
  });

  it('Trie.prototype.density in Pictographic Language', function() {
    var trie = new Trie();
    trie.add('关键字');
    trie.add('关键');

    trie.density('这段文字一共包括2个"关键"，1个"关键字"')
      .should.be.deepEqual({ '关键': 2, '关键字': 1 });
  });
});

