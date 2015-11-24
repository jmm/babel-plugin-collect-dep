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
        opts = state.opts,
        args
      ;

      if (path.scope.hasBinding(opts.word, true)) {
        path.stop();
        return;
      }

      if (! opts.isRequire(node)) {
        return;
      }

      args = node.arguments;
      if (args.length) {
        if (args[0].type === "StringLiteral") {
          opts.dep("strings", args[0].value);
        }
        else {
          opts.dep("expressions", path.get("arguments.0").getSource())
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
