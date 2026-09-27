/**
 * rehype-heading-levels.js
 *
 * Requires:
 * - npm i unist-util-visit
 */
import { visit } from "unist-util-visit";

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/**
 * Give every markdown heading a `level` for the page outline. The element
 * name stays as the markdown depth, so mdx-components.tsx still picks the
 * look from `#`, `##` and so on, and uses `level` for the element it renders.
 *
 * The layout renders the page title as the only <h1>, so the top headings of
 * a file are level 2, and each heading is one level below the nearest heading
 * above it with a smaller depth. So a file that starts at `##` (the legal
 * pages) gets the same outline as one that starts at `#`, and no level is
 * skipped.
 *
 * `components` names the MDX components that render a heading themselves,
 * with the markdown depth that they stand for. For example, `<Step>` renders
 * a `#`-style title, so the headings inside it are one level below it.
 *
 * @param {{components?: Record<string, number>}} [options]
 */
export const rehypeHeadingLevels = ({ components = {} } = {}) => {
  return (tree) => {
    /** @type {Array<number>} */
    const open = [];

    visit(tree, (node) => {
      let depth;
      if (node.type === "element" && HEADINGS.has(node.tagName)) {
        depth = Number(node.tagName.slice(1));
      } else if (
        (node.type === "mdxJsxFlowElement" ||
          node.type === "mdxJsxTextElement") &&
        node.name in components
      ) {
        depth = components[node.name];
      } else {
        return;
      }

      while (open.length && open[open.length - 1] >= depth) {
        open.pop();
      }
      if (node.type === "element") {
        node.properties ??= {};
        node.properties.level = Math.min(open.length + 2, 6);
      }
      open.push(depth);
    });
  };
};

export default rehypeHeadingLevels;
