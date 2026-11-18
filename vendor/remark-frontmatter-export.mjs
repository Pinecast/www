/**
 * remark-frontmatter-export.mjs
 *
 * Requires:
 * - npm i micromark-extension-frontmatter mdast-util-frontmatter js-yaml
 */
import yaml from 'js-yaml';
import {frontmatter} from 'micromark-extension-frontmatter';
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown,
} from 'mdast-util-frontmatter';

/**
 * YAML frontmatter at the top of an MDX file, exported as `frontmatter`:
 *
 *   ---
 *   title: Collaborators
 *   description: Work on your podcast with your friends.
 *   ---
 *
 *   export default layoutWrapper(FeatureLayout, frontmatter);
 *
 * The text of a page that is not in its body (its title and description) goes
 * here, so that Lingo.dev translates it with the page: `translateFrontmatterFields`
 * in .lingo/config.json. An export is code, and Lingo.dev leaves it as it is.
 *
 * The YAML is read with the JSON schema: a value is text, a number, true,
 * false or null, never a date.
 */
export default function remarkFrontmatterExport() {
  const data = this.data();
  (data.micromarkExtensions ??= []).push(frontmatter(['yaml']));
  (data.fromMarkdownExtensions ??= []).push(frontmatterFromMarkdown(['yaml']));
  (data.toMarkdownExtensions ??= []).push(frontmatterToMarkdown(['yaml']));
  return tree => {
    const index = tree.children.findIndex(node => node.type === 'yaml');
    if (index === -1) return;
    const value = yaml.load(tree.children[index].value, {
      schema: yaml.JSON_SCHEMA,
    });
    tree.children[index] = {
      type: 'mdxjsEsm',
      value: '',
      data: {estree: exportConst('frontmatter', value ?? {})},
    };
  };
}

// The program `export const <name> = <value>;`.
function exportConst(name, value) {
  return {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'ExportNamedDeclaration',
        attributes: [],
        source: null,
        specifiers: [],
        declaration: {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: {type: 'Identifier', name},
              init: expression(value),
            },
          ],
        },
      },
    ],
  };
}

function expression(value) {
  if (Array.isArray(value)) {
    return {type: 'ArrayExpression', elements: value.map(expression)};
  }
  if (value !== null && typeof value === 'object') {
    return {
      type: 'ObjectExpression',
      properties: Object.entries(value).map(([key, item]) => ({
        type: 'Property',
        kind: 'init',
        method: false,
        shorthand: false,
        computed: false,
        key: {type: 'Literal', value: key},
        value: expression(item),
      })),
    };
  }
  if (typeof value === 'number' && value < 0) {
    return {
      type: 'UnaryExpression',
      operator: '-',
      prefix: true,
      argument: {type: 'Literal', value: -value},
    };
  }
  return {type: 'Literal', value};
}
