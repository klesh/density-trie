/**
 * Implement Trie Tree by ES6 Map, provide keywords density calculation functionality.
 */

var _ = require('lodash');

const OPEN_END = '$$';
const DEAD_END = 0;

/**
 * Trie constructor, work in Pictographic mode defaultly, 
 * set symbolic to true if you are processing Western languages
 *
 * @params {boolean} symbolic
 */
function Trie(symbolic) {
  this.root = this.node();
  this.symbolic = symbolic ? /\W/ : false;
}

/**
 * Create new node
 */
Trie.prototype.node = function(isOpenEnd) {
  var node = new Map();
  if (isOpenEnd)
    node.set(OPEN_END, true);
  return node;
};

/**
 * Ensure word is String type
 */
Trie.prototype.ensure = function(word) {
  if (!_.isString(word) || word.length === 0)
    throw new Error('Only String type is accepted');
};

/**
 * Add a word to tree
 */
Trie.prototype.add = function(word) {
  this.ensure(word);

  var node = this.root;
  for (var i = 0, j = word.length; i < j; i++) {
    var k = word[i], v = node.get(k);
    if (i !== j - 1) {
      v = v || this.node(v === DEAD_END);
    } else {
      if (v)
        v.set(OPEN_END, true);
      else
        v = DEAD_END;
    }
    node.set(k, v);
    node = v;
  }
  return this;
};

/**
 * Remove a word from tree
 */
Trie.prototype.remove = function(word) {
  this.ensure(word);

  var path = this.lookup(word), dead = null, open = null;
  if (!path) return;

  var j = path.length - 1;
  var parent = path[j];
  var current = parent.get(word[j]);

  if (current === DEAD_END) {
    current = null;
    for (var i = j; i >= 0; i--) {
      parent = path[i];
      if (current === true)
        parent.set(word[i], DEAD_END);

      if (current !== null)
        break;

      parent.delete(word[i]);
      if (parent.size === 0) {
        current = null;
      } else {
        current = true;
      }
    }
  } else if (current.get(OPEN_END)) {
    current.delete(OPEN_END);
  }
  return this;
};

/**
 * Return end of node if word is exists
 */
Trie.prototype.lookup = function(word) {
  this.ensure(word);

  var node = this.root, path = [];
  for (var i = 0, j = word.length; i < j; i++) {
    if (node === DEAD_END)
      return null;
    path.push(node);
    node = node.get(word[i]);
    if (node === undefined)
      return null;
  }
  return node === DEAD_END || node.get(OPEN_END) ? path : null;
};

/*
 * Observe trie structure
 */
Trie.prototype.dump = function(node) {
  var buff = [];
  function d(o, i) {
    i = i || 0;
    if (o instanceof Map) {
      var prefix = _.repeat(' ', i);

      for (var k of o.keys()) {
        if (buff.length) buff.push('\n');
        buff.push(prefix);
        buff.push(k);
        buff.push(": ");
        d(o.get(k), i + 1);
      }
    } else {
      buff.push(o);
    }
  }
  d(node || this.root);
  return buff.join('');
};

/**
 * For western language, to check word's boundary, which no need for Pictographic languages
 */
Trie.prototype.ensureBoundary = function(text, word, index) {
  if (this.symbolic === false)
    return true;

  var suffix = text[index + 1];
  if (suffix && !this.symbolic.test(suffix))
    return false;
  var prefix = text[index - word.length];
  if (prefix && !this.symbolic.test(prefix))
    return false;

  return true;
};

/**
 * Calcuate keywords density over text
 */
Trie.prototype.density = function(text) {
  var results = {};
  var self = this;
  function addToResult(keyword, index) {
    if (!self.ensureBoundary(text, keyword, index))
      return;
    var count = results[keyword] || 0;
    results[keyword] = count + 1;
  }

  var founds = {}; // 临时存储
  for (var index = 0, length = text.length; index < length; index++)  {
    var c = text[index];

    // 在已找到的模式中匹配
    for (var keyword in founds) {

      var trie = founds[keyword];
      var find = trie.get(c);
      delete founds[keyword]; // 删除老的节点。

      if (find !== undefined) {
        var newKeyword = keyword + c;
        if (find === DEAD_END) { // 找到完整关键词, 并且后面没有了
          addToResult(newKeyword, index); 
        } else if (find.get(OPEN_END)) { // 完整关键词，但还有更长的关键词
          addToResult(newKeyword, index); 
          founds[newKeyword] = find; 
        } else { // 关键词还不完整
          founds[newKeyword] = find; 
        }
      }

    }

    var tmp = this.root.get(c);
    if (tmp) 
      founds[c] = tmp;
  }
  return results;
};

Trie.OPEN_END = OPEN_END;
Trie.DEAD_END = DEAD_END;

module.exports = Trie;
