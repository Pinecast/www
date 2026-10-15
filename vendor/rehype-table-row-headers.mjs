/**
 * rehype-table-row-headers.js
 *
 * Requires:
 * - npm i unist-util-visit
 */
import { visit } from "unist-util-visit";

/**
 * Tell if a hast node shows something: text that is not only whitespace, an
 * image, or an MDX expression. An element with children shows something if
 * one of them does.
 * @param {object} node
 * @returns {boolean}
 */
const hasContent = (node) => {
  if (node.type === "text") {
    return node.value.trim() !== "";
  }
  if (node.type === "comment") {
    return false;
  }
  if (node.type === "element" && node.children.length > 0) {
    return node.children.some(hasContent);
  }
  return true;
};

/**
 * A markdown table has one row of headers, at the top. The first cell of each
 * body row says what the row is about (the name of a company, for example),
 * but it is a `td`. A screen reader does not read it as the header of the
 * other cells, so a link in the row has no context. This makes that cell a row
 * header: a `th` with `scope="row"`.
 *
 * A cell with nothing in it stays a `td`. An empty header is a defect.
 *
 * Only the tables of markdown get this. A `<table>` that a page writes in JSX
 * stays as written.
 */
export const rehypeTableRowHeaders = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "tbody") {
        return;
      }
      for (const row of node.children) {
        if (row.type !== "element" || row.tagName !== "tr") {
          continue;
        }
        const cell = row.children.find((child) => child.type === "element");
        if (cell?.tagName === "td" && cell.children.some(hasContent)) {
          cell.tagName = "th";
          cell.properties = { ...cell.properties, scope: "row" };
        }
      }
    });
  };
};

export default rehypeTableRowHeaders;
