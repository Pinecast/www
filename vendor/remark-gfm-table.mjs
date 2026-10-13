/**
 * remark-gfm-table.js
 *
 * Requires:
 * - npm i micromark-extension-gfm-table mdast-util-gfm-table
 */
import { gfmTable } from "micromark-extension-gfm-table";
import {
  gfmTableFromMarkdown,
  gfmTableToMarkdown,
} from "mdast-util-gfm-table";

/**
 * Parse GitHub-style tables in markdown, and nothing else of GFM.
 *
 * remark-gfm also turns each bare URL and email address into a link. That
 * links the made-up addresses in examples, and puts a second link inside an
 * `<a>` that a page writes around an address. This adds only the table
 * syntax, the same way remark-gfm adds each of its parts.
 */
export default function remarkGfmTable() {
  const data = this.data();
  (data.micromarkExtensions ??= []).push(gfmTable());
  (data.fromMarkdownExtensions ??= []).push(gfmTableFromMarkdown());
  (data.toMarkdownExtensions ??= []).push(gfmTableToMarkdown());
}
