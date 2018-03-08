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
    throw new Error('Accept strings only');
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
      o.forEach(function(value, key) {
        if (buff.length) buff.push('\n');
        buff.push(prefix);
        buff.push(k);
        buff.push(": ");
        d(o.get(k), i + 1);
      });
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
 * Check if any keyword exists in text
 */
Trie.prototype.check = function(text) {
  var found;
  this.exec(text, function(word) {
    found = word;
    return false; // break down iteration.
  });
  return found;
}

/**
 * Replace keywords in text with placeholder, default: *
 */
Trie.prototype.replace = function(text, placeholder) {
  placeholder = placeholder || '*';
  var result = '', lastIndex = -1;
  this.exec(text, function(word, endIndex) {
    var length = word.length;
    var startIndex = endIndex - length;
    if (lastIndex === -1 || lastIndex < startIndex) {
      result += text.substring(lastIndex + 1, startIndex + 1);
    }

    var greed = startIndex < lastIndex;
    var j = greed ? endIndex - lastIndex : length;
    for (var i = 0; i < j; i++) {
      result += placeholder;
    }
    lastIndex = endIndex;
  });
  result += text.substring(lastIndex + 1);
  return result;
}

/**
 * Calcuate keywords density over text
 */
Trie.prototype.density = function(text) {
  var result = {};
  this.exec(text, function(word) {
    result[word] = ( result[word] || 0 ) + 1;
  });
  return result;
}

/**
 * Execute on text
 */
Trie.prototype.exec = function(text, cb) {
  this.ensure(text);

  var drafts = {};

  for (var i = 0, j = text.length; i < j; i++) {
    var c = text[i];
    for (var parentWord in drafts) {
      var parentNode = drafts[parentWord];
      delete drafts[parentWord];

      var currentNode = parentNode.get(c);
      if (currentNode === undefined) {
        continue;
      }

      var currentWord = parentWord + c;
      var deadEnd = currentNode === DEAD_END;
      if (deadEnd || currentNode.get(OPEN_END)) {
        if (this.ensureBoundary(text, currentWord, i)) {
          if (cb(currentWord, i) === false)
            return;
        }
      }

      if (!deadEnd) { // is an open end or uncomplete word.
        drafts[currentWord] = currentNode;
      }
    }

    var node = this.root.get(c);
    if (node)
      drafts[c] = node;
  }
};

Trie.OPEN_END = OPEN_END;
Trie.DEAD_END = DEAD_END;

module.exports = Trie;
