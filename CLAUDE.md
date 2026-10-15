# Pinecast www

The marketing site. `README.md` says how to run it and which checks to run
(`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run check:structure`
and `npm test`). Its sections on accessibility structure, motion and the
loading order of the home page say how the site works. Read them before you
change a page, a header, a footer or an animation.

## Tests do not check copy

**Do not write a test that fails when a person changes the text or the address
of a link, a heading or other content.** A test like that fails the build of a
person who edits the copy, after the work is done. That is rude. Tell the
person before they start:

- Put a comment at the content. In MDX, use `{/* ... */}`. In TSX, use
  `{/* ... */}` in JSX or `//` in code. Say why the content is there and what
  to do if it must change.
- Or add a lint rule, so that the editor shows the problem while the person
  types.

A test is the right tool for behavior that can break by accident, with no one
meaning to change it: a layout at a narrow width, keyboard focus, a link that a
floating control covers, motion, contrast. Write such a test so that it does not
know the copy. Find an element by its structure, not by its words, and check
every link in a group, not a list of named links. `tests/footer.spec.ts` does
this: it finds the legal row of the footer by its © line.

Examples of the comment:

- `src/pages/features/accessibility.mdx`: the link to the help center section.
- `src/components/Footer.tsx`: the link to the accessibility statement, and the
  row that `tests/footer.spec.ts` checks.
