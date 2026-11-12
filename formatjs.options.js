// Options of the `@formatjs/ts-transformer` pass that gives each message its
// `id` (`vendor/formatjs-loader.js` runs it in the webpack build). The source
// never spells an id out: the id is a hash of `defaultMessage` and
// `description`, as in pinecast-ts.
//
// `overrideIdFn` and `preserveWhitespace` must match the
// `--id-interpolation-pattern` and `--preserve-whitespace` of the
// `i18n:extract` script in package.json. If the two differ, the ids in
// lang/en.json stop matching the ones in the bundle, and no translation is
// found.
module.exports = {
  overrideIdFn: '[sha512:contenthash:base64:6]',
  additionalComponentNames: ['FormattedMessage'],
  additionalFunctionNames: ['formatMessage'],
  // Each `defaultMessage` goes into the bundle parsed, so the bundle does not
  // need the ICU parser (next.config.js swaps it for its `no-parser` build).
  // A catalog of another locale must be compiled with `formatjs compile --ast`
  // for the same reason.
  ast: true,
  // Without it, the transform trims each message and turns each run of
  // white space into one space: a no-break space (U+00A0) too. Then the
  // page would not show what the source says.
  preserveWhitespace: true,
  throws: true,
};
