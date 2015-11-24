var
  generate = require("babel-generator").default;

exports = module.exports = plugin;

exports.default_word = "require";

exports.default_deps = function (opts) {
  opts = opts || {};

  var deps = {
    strings: [],
    expressions: [],
  };

  if (opts.nodes) deps.nodes = [];

  return deps;
};

function plugin () {
  var visitor = {
    CallExpression: function (path, state) {
      var
        node = path.node,
        opts = state.opts
      ;

      if (
        ! opts.isRequire(node) ||
        path.scope.hasBinding(opts.word, true)
      ) {
        return;
      }

      if (node.arguments.length) {
        if (node.arguments[0].type === "StringLiteral") {
          opts.dep("strings", node.arguments[0].value);
        }
        else {
          opts.dep("expressions", generate(node.arguments[0]).code);
        }
      }
      if (opts.nodes) opts.dep("nodes", node);
    },
    // CallExpression
  };

  return {
    pre: function () {
      opts = this.opts;

      if (! opts.word) opts.word = exports.default_word;

      if (! opts.isRequire) opts.isRequire = function (node) {
        return node.callee.type === "Identifier" && node.callee.name === opts.word;
      };
    },
    manipulateOptions: function (opts, parserOpts, file) {
      parserOpts.allowReturnOutsideFunction = true;
    },
    visitor: visitor,
  };
};
// plugin
