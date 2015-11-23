var
  babel = require("babel-core");

exports = module.exports = plugin;

exports.default_word = 'require';

exports.default_deps = function (opts) {
  opts = opts || {};

  var deps = {
    strings: [],
    expressions: [],
  };

  if (opts.nodes) deps.nodes = [];

  return deps;
};

function plugin (b, opts) {
  opts = opts || {};
  var word = opts.word === undefined ? exports.default_word : opts.word;

  var deps = opts.deps || exports.default_deps({nodes: opts.nodes});

  var isRequire = opts.isRequire || function (node) {
    return node.callee.type === 'Identifier' && node.callee.name === word;
  };

  var visitors = {
    CallExpression: function (node, parent, scope, state) {
      if (
        ! isRequire(node) ||
        scope.hasBinding(word, true)
      ) {
        return;
      }

      if (node.arguments.length) {
        if (node.arguments[0].type === 'Literal') {
          deps.strings.push(node.arguments[0].value);
        }
        else {
          // JMMDEBUG
          // deps.expressions.push(escodegen.generate(node.arguments[0]));
        }
      }
      if (opts.nodes) deps.nodes.push(node);
    },
    // CallExpression
  };

  return new b.Plugin('collect-dep', {visitor: visitors});
};
// plugin

module.exports.make = function (opts) {
  return function (babel) {
    return plugin.call(this, babel, opts);
  };
};
// make
