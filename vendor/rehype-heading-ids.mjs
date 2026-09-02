/**
 * rehype-heading-ids.js
 *
 * Requires:
 * - npm i unist-util-visit
 */
import { visit } from "unist-util-visit";

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/**
 * Turn a heading's text into a URL fragment: lowercased, punctuation dropped,
 * whitespace collapsed into hyphens.
 * @param {string} text
 */
const slugify = (text) =>
  text
    .normalize("NFKD")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .replace(/\s+/g, "-");

/**
 * Collect the visible text of a hast node. MDX expressions and components
 * without literal children contribute nothing, which is fine: they can't be
 * slugified anyway.
 * @param {object} node
 */
const textOf = (node) => {
  if (node.type === "text") {
    return node.value;
  }
  if (!node.children) {
    return "";
  }
  return node.children.map(textOf).join("");
};

/**
 * Give every markdown heading an `id` so it can be linked to directly. Slugs
 * are unique within a document: repeats get a `-2`, `-3`, ... suffix, matching
 * the way GitHub numbers its own heading anchors.
 */
export const rehypeHeadingIds = () => {
  return (tree) => {
    /** @type {Map<string, number>} */
    const seen = new Map();

    visit(tree, "element", (node) => {
      if (!HEADINGS.has(node.tagName)) {
        return;
      }
      node.properties ??= {};
      if (node.properties.id) {
        // An explicit id wins, but still reserve it so a later heading with
        // the same text doesn't collide with it.
        seen.set(String(node.properties.id), 1);
        return;
      }

      const slug = slugify(textOf(node)) || "section";
      const count = seen.get(slug) ?? 0;
      seen.set(slug, count + 1);
      node.properties.id = count === 0 ? slug : `${slug}-${count + 1}`;
    });
  };
};

export default rehypeHeadingIds;
