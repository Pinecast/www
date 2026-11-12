// A webpack loader that runs the formatjs transform (`@formatjs/ts-transformer`)
// over a module that uses react-intl, before SWC compiles it. The transform
// gives each message descriptor its `id` and parses its `defaultMessage` (see
// formatjs.options.js). pinecast-ts runs the same transform through ts-loader.
//
// It prints the module again with TypeScript: the types go, and JSX stays for
// SWC. A module that does not import react-intl passes through as it is.
const ts = require('typescript');
const {transform} = require('@formatjs/ts-transformer');

const options = require('../formatjs.options.js');

module.exports = function formatjsLoader(source) {
  if (!source.includes("from 'react-intl'")) {
    return source;
  }
  const {outputText, diagnostics} = ts.transpileModule(source, {
    fileName: this.resourcePath,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      isolatedModules: true,
      // SWC gets the JSX and the class fields as they are written.
      useDefineForClassFields: true,
    },
    transformers: {before: [transform(options)]},
  });
  if (diagnostics?.length) {
    const message = ts.formatDiagnostics(diagnostics, {
      getCanonicalFileName: f => f,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n',
    });
    this.emitError(new Error(message));
  }
  return outputText;
};
