import Image from 'next/image';
import * as React from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import type {StyleObject} from 'styletron-react';

import {
  CAN_HOVER_MEDIA_QUERY,
  MIN_TABLET_MEDIA_QUERY,
  MOBILE_BREAKPOINT,
  MOBILE_MEDIA_QUERY,
} from '@/constants';
import {
  GintoNordCondensed,
  MonumentGroteskBold,
  MonumentGroteskRegular,
  MonumentGroteskSemiMono,
} from '@/fonts';
import {useCSS} from '@/hooks/useCSS';
import {DEFAULT_LOCALE, usePageLocale} from '@/i18n';
import {Download} from '@/icons/Download';
import {RightArrow} from '@/icons/RightArrow';
import {type HeadingLevel, Overline, Subhead} from './Typography';

// The card of the Accessibility Conformance Report (ACR) at the end of the
// Accessibility page (content/en/features/accessibility.mdx): a cover of the
// PDF on the left, and on the right the text, the results of the report, its
// facts and the download link. The design is direction A of the "ACR download
// component" canvas, in the Website Identity of the Figma file.
//
// The page's text gives the parts, in their order, so that Lingo.dev
// translates them with the rest of the page:
//
//   <AcrCard href=… bytes=… pages=… frontPage=… backPage=…>
//     <AcrOverline>…</AcrOverline>
//     <AcrHeading>…</AcrHeading>
//     <AcrText>…</AcrText>
//     <AcrResults supports=… partiallySupports=… … />
//     <AcrFacts><dt>…</dt><dd>…</dd>…</AcrFacts>
//     <AcrActions>
//       <AcrDownloadButton />
//       <AcrBountyLink href="#…">…</AcrBountyLink>
//     </AcrActions>
//   </AcrCard>
//
// The words that go with a number (the counts, the page count, the size of
// the file) are messages here.

// Two columns wherever the page is wider than a phone. Not MIN_TABLET: the
// type gets larger there, and two queries that overlap must not set the same
// property (Styletron does not sort them).
const TWO_COLUMNS_MEDIA_QUERY = `@media not all and (max-width: ${MOBILE_BREAKPOINT}px)`;

const SPACE = 'var(--color-space)';
const HATCHED = (stripe: number) =>
  `repeating-linear-gradient(-45deg, var(--color-orchid) 0, var(--color-orchid) ${stripe}px, ${SPACE} ${stripe}px, ${SPACE} ${stripe * 1.5}px)`;

const CAPTION: StyleObject = {
  ...MonumentGroteskSemiMono,
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '14px',
  [MOBILE_MEDIA_QUERY]: {fontSize: '10px', lineHeight: '12px'},
};

type AcrFile = {href: string; bytes: number};
const AcrFileContext = React.createContext<AcrFile | null>(null);

export const AcrCard = ({
  backPage,
  bytes,
  children,
  frontPage,
  href,
  pages,
}: {
  // A page of the report, behind the front page.
  backPage: string;
  // The size of the PDF, for the label of the download link.
  bytes: number;
  children: React.ReactNode;
  // The first page of the report, in front.
  frontPage: string;
  // The PDF, in public/.
  href: string;
  // The number of pages of the PDF, on the sticker.
  pages: number;
}) => {
  const css = useCSS();
  const file = React.useMemo(() => ({href, bytes}), [href, bytes]);
  const page: StyleObject = {
    border: `1px solid ${SPACE}`,
    height: 'auto',
    position: 'absolute',
  };
  return (
    <AcrFileContext.Provider value={file}>
      <div
        className={css({
          backgroundColor: 'var(--color-white)',
          border: `1px solid ${SPACE}`,
          borderRadius: '20px',
          color: SPACE,
          display: 'flex',
          flexDirection: 'column',
          marginBottom: 0,
          marginLeft: '6px',
          marginRight: '6px',
          marginTop: '40px',
          overflow: 'hidden',
          textAlign: 'left',
          [TWO_COLUMNS_MEDIA_QUERY]: {
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
          },
          [MIN_TABLET_MEDIA_QUERY]: {
            borderRadius: '24px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '60px',
            maxWidth: '1040px',
          },
        })}
      >
        {/* The cover is a picture of the PDF. The link says what the file is,
            and the text says how long it is. */}
        <div
          aria-hidden="true"
          className={css({
            backgroundColor: 'var(--color-orchid)',
            borderBottom: `1px solid ${SPACE}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            justifyContent: 'space-between',
            padding: '28px 24px 18px',
            [TWO_COLUMNS_MEDIA_QUERY]: {
              borderBottom: 'none',
              borderRight: `1px solid ${SPACE}`,
            },
            [MIN_TABLET_MEDIA_QUERY]: {
              gap: '24px',
              padding: '48px 40px 40px',
            },
          })}
        >
          <div
            className={css({
              aspectRatio: '310 / 250',
              position: 'relative',
              [TWO_COLUMNS_MEDIA_QUERY]: {aspectRatio: '336 / 420'},
            })}
          >
            <Image
              src={backPage}
              alt=""
              width={680}
              height={525}
              className={css({
                ...page,
                boxShadow: '0 10px 20px rgba(9, 9, 9, 0.18)',
                left: 0,
                top: '10%',
                transform: 'rotate(-7deg)',
                width: '71%',
                [TWO_COLUMNS_MEDIA_QUERY]: {top: '11.4%', width: '89%'},
              })}
            />
            <Image
              src={frontPage}
              alt=""
              width={680}
              height={525}
              className={css({
                ...page,
                boxShadow: '0 14px 24px rgba(9, 9, 9, 0.22)',
                left: '9.7%',
                top: '27%',
                transform: 'rotate(4deg)',
                width: '76%',
                [TWO_COLUMNS_MEDIA_QUERY]: {
                  left: '6.5%',
                  top: '35.7%',
                  width: '94.6%',
                },
              })}
            />
            <div
              className={css({
                ...MonumentGroteskSemiMono,
                alignItems: 'center',
                backgroundColor: 'var(--color-lime)',
                border: `1px solid ${SPACE}`,
                borderRadius: '50%',
                boxShadow: '0 6px 14px rgba(9, 9, 9, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '10px',
                height: '104px',
                justifyContent: 'center',
                lineHeight: '12px',
                position: 'absolute',
                right: '-6px',
                textAlign: 'center',
                textTransform: 'uppercase',
                top: '-10px',
                transform: 'rotate(-12deg)',
                width: '104px',
                [MIN_TABLET_MEDIA_QUERY]: {
                  fontSize: '12px',
                  height: '144px',
                  lineHeight: '14px',
                  right: '-14px',
                  top: '-18px',
                  width: '144px',
                },
              })}
            >
              <FormattedMessage
                description="Sticker on the cover of the Accessibility Conformance Report, on the Accessibility page: a joke about the length of the report. The number is large, on a line of its own, between the words before it and the words after it. Shown in capital letters. {pages} is the number of pages of the report"
                defaultMessage="Light reading <number>{pages}</number> {pages, plural, one {page} other {pages}}"
                values={{
                  pages,
                  number: (chunks: React.ReactNode) => (
                    <span
                      className={css({
                        ...GintoNordCondensed,
                        display: 'block',
                        fontSize: '46px',
                        letterSpacing: '-0.04em',
                        lineHeight: '42px',
                        [MIN_TABLET_MEDIA_QUERY]: {
                          fontSize: '64px',
                          lineHeight: '58px',
                        },
                      })}
                    >
                      {chunks}
                    </span>
                  ),
                }}
              />
            </div>
          </div>
          <p className={css({...CAPTION, margin: 0})}>
            {href.split('/').pop()}
          </p>
        </div>

        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            padding: '28px 22px',
            [MIN_TABLET_MEDIA_QUERY]: {
              gap: '28px',
              padding: '48px 48px 44px',
            },
          })}
        >
          {children}
        </div>
      </div>
    </AcrFileContext.Provider>
  );
};

export const AcrOverline = ({children}: {children: React.ReactNode}) => (
  <Overline>{children}</Overline>
);

// The heading of the card. It is below the `#` heading of the section, so it
// is an <h3>; `level` changes that if the section moves. It fits its words to
// the column, for a translation with a long word.
export const AcrHeading = ({
  children,
  level = 3,
}: {
  children: React.ReactNode;
  level?: HeadingLevel;
}) => (
  <Subhead fit level={level} style={{marginTop: '-6px'}}>
    {children}
  </Subhead>
);

export const AcrText = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <p
      className={css({
        ...MonumentGroteskRegular,
        fontSize: '18px',
        lineHeight: '1.2',
        margin: '-6px 0 0',
      })}
    >
      {children}
    </p>
  );
};

// The results of the web column of the report for WCAG 2.2 at Level A and AA,
// by conformance level: a bar and a list. The bar is a picture of the list,
// so it is hidden from screen readers. The terms are the report's own.
export const AcrResults = ({
  doesNotSupport,
  notApplicable,
  partiallySupports,
  supports,
}: {
  doesNotSupport: number;
  notApplicable: number;
  partiallySupports: number;
  supports: number;
}) => {
  const css = useCSS();
  const total = supports + partiallySupports + notApplicable + doesNotSupport;
  const share = (count: number) => `${((100 * count) / total).toFixed(2)}%`;
  const bold = (chunks: React.ReactNode) => (
    <strong className={css({...MonumentGroteskBold, fontWeight: 400})}>
      {chunks}
    </strong>
  );
  const pill: StyleObject = {
    border: `1px solid ${SPACE}`,
    borderRadius: '300px',
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  };
  const swatch = (style: StyleObject) => (
    <span
      aria-hidden="true"
      className={css({
        border: `1px solid ${SPACE}`,
        borderRadius: '50%',
        flex: 'none',
        height: '16px',
        width: '16px',
        ...style,
      })}
    />
  );
  const item = css({alignItems: 'center', display: 'flex', gap: '10px'});
  return (
    <div className={css({display: 'flex', flexDirection: 'column', gap: '14px'})}>
      <div
        className={css({
          ...CAPTION,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          justifyContent: 'space-between',
          textTransform: 'uppercase',
        })}
      >
        <span>
          <FormattedMessage
            description="Label above the results of the Accessibility Conformance Report (ACR), on the Accessibility page. The results are those of the web column of the report, for the success criteria of WCAG 2.2 at Level A and AA. Shown in capital letters"
            defaultMessage="WCAG 2.2 Level A and AA · Web"
          />
        </span>
        <span>
          <FormattedMessage
            description="Number of WCAG success criteria in the results of the Accessibility Conformance Report, at the right end of the label above them, on the Accessibility page. Shown in capital letters"
            defaultMessage="{count, plural, one {# criterion} other {# criteria}}"
            values={{count: total}}
          />
        </span>
      </div>
      <div
        aria-hidden="true"
        className={css({
          height: '32px',
          position: 'relative',
          [MIN_TABLET_MEDIA_QUERY]: {height: '40px'},
        })}
      >
        <div
          className={css({
            backgroundColor: SPACE,
            height: '1px',
            left: 0,
            position: 'absolute',
            right: 0,
            top: '50%',
          })}
        />
        <div
          className={css({
            bottom: 0,
            left: '12px',
            position: 'absolute',
            right: '12px',
            top: 0,
            [MIN_TABLET_MEDIA_QUERY]: {left: '24px', right: '24px'},
          })}
        >
          <div
            className={css({
              ...pill,
              backgroundColor: 'var(--color-sand)',
              width: '100%',
            })}
          />
          <div
            className={css({
              ...pill,
              backgroundImage: HATCHED(4),
              width: share(supports + partiallySupports),
            })}
          />
          <div
            className={css({
              ...pill,
              ...CAPTION,
              alignItems: 'center',
              backgroundColor: 'var(--color-lime)',
              display: 'flex',
              justifyContent: 'flex-end',
              paddingRight: '14px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              width: share(supports),
              [MIN_TABLET_MEDIA_QUERY]: {paddingRight: '20px'},
            })}
          >
            <FormattedMessage
              description="Number of WCAG success criteria that Pinecast supports, in the results of the Accessibility Conformance Report on the Accessibility page. “Supports” is a conformance level of the report (VPAT), with “Partially Supports”, “Does Not Support” and “Not Applicable”. The number is in bold"
              defaultMessage="<b>{count}</b> Supports"
              values={{count: supports, b: (chunks: React.ReactNode) => chunks}}
            />
          </div>
        </div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- `listStyle: none` drops the role in Safari */}
      <ul
        role="list"
        className={css({
          ...MonumentGroteskRegular,
          display: 'grid',
          fontSize: '18px',
          gap: '8px 24px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          lineHeight: '1.2',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        })}
      >
        <li className={item}>
          {swatch({backgroundColor: 'var(--color-lime)'})}
          <span>
            <FormattedMessage
              description="Number of WCAG success criteria that Pinecast supports, in the results of the Accessibility Conformance Report on the Accessibility page. “Supports” is a conformance level of the report (VPAT), with “Partially Supports”, “Does Not Support” and “Not Applicable”. The number is in bold"
              defaultMessage="<b>{count}</b> Supports"
              values={{count: supports, b: bold}}
            />
          </span>
        </li>
        <li className={item}>
          {swatch({backgroundImage: HATCHED(3)})}
          <span>
            <FormattedMessage
              description="Number of WCAG success criteria that Pinecast partially supports, in the results of the Accessibility Conformance Report on the Accessibility page. “Partially Supports” is a conformance level of the report (VPAT), with “Supports”, “Does Not Support” and “Not Applicable”. The number is in bold"
              defaultMessage="<b>{count}</b> Partially Supports"
              values={{count: partiallySupports, b: bold}}
            />
          </span>
        </li>
        <li className={item}>
          {swatch({backgroundColor: 'var(--color-sand)'})}
          <span>
            <FormattedMessage
              description="Number of WCAG success criteria that do not apply to Pinecast, in the results of the Accessibility Conformance Report on the Accessibility page. “Not Applicable” is a conformance level of the report (VPAT), with “Supports”, “Partially Supports” and “Does Not Support”. The number is in bold"
              defaultMessage="<b>{count}</b> Not Applicable"
              values={{count: notApplicable, b: bold}}
            />
          </span>
        </li>
        <li className={item}>
          {swatch({borderStyle: 'dashed'})}
          <span>
            <FormattedMessage
              description="Number of WCAG success criteria that Pinecast does not support, in the results of the Accessibility Conformance Report on the Accessibility page. “Does Not Support” is a conformance level of the report (VPAT), with “Supports”, “Partially Supports” and “Not Applicable”. The number is in bold"
              defaultMessage="<b>{count}</b> Does Not Support"
              values={{count: doesNotSupport, b: bold}}
            />
          </span>
        </li>
      </ul>
    </div>
  );
};

// The facts of the report: a <dt> and a <dd> for each, from the page's text.
export const AcrFacts = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  const rule = '1px solid var(--color-core-accent)';
  return (
    <dl
      className={css({
        ...MonumentGroteskRegular,
        borderBottom: rule,
        display: 'flex',
        flexDirection: 'column',
        fontSize: '18px',
        lineHeight: '1.2',
        margin: 0,
        ':not(:empty) > dt': {
          ...MonumentGroteskBold,
          borderTop: rule,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          paddingTop: '12px',
          paddingBottom: '4px',
        },
        ':not(:empty) > dd': {
          marginLeft: 0,
          paddingBottom: '12px',
        },
        [MIN_TABLET_MEDIA_QUERY]: {
          columnGap: '20px',
          display: 'grid',
          gridTemplateColumns: '150px minmax(0, 1fr)',
          ':not(:empty) > dt': {
            fontSize: '22px',
            lineHeight: '1.1',
            paddingBottom: '12px',
          },
          ':not(:empty) > dd': {
            borderTop: rule,
            paddingTop: '14px',
          },
        },
      })}
    >
      {children}
    </dl>
  );
};

export const AcrActions = ({children}: {children: React.ReactNode}) => {
  const css = useCSS();
  return (
    <div
      className={css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px 28px',
      })}
    >
      {children}
    </div>
  );
};

// The link to the PDF, drawn as the Primary button of the Figma file. Its
// label says the format and the size. On a page in another language it also
// says that the report is in English, and the link has `hreflang="en"`.
export const AcrDownloadButton = () => {
  const css = useCSS();
  const intl = useIntl();
  const locale = usePageLocale();
  const file = React.useContext(AcrFileContext);
  if (!file) {
    throw new Error('<AcrDownloadButton> goes inside an <AcrCard>.');
  }
  const size = intl.formatNumber(file.bytes / 1_000_000, {
    maximumSignificantDigits: 2,
    style: 'unit',
    unit: 'megabyte',
    unitDisplay: 'short',
  });
  const english = locale === DEFAULT_LOCALE;
  return (
    <a
      href={file.href}
      hrefLang={english ? undefined : DEFAULT_LOCALE}
      type="application/pdf"
      className={css({
        ...MonumentGroteskBold,
        alignItems: 'center',
        backgroundColor: SPACE,
        borderRadius: '10px',
        color: 'var(--color-sand)',
        display: 'flex',
        fontSize: '16px',
        gap: '10px',
        justifyContent: 'center',
        // A label that is too long for the row (a translation, or larger
        // text spacing at 320px) wraps, and the button grows with it.
        lineHeight: '20px',
        minHeight: '40px',
        padding: '8px 15px',
        textDecoration: 'none',
        transitionDuration: '150ms',
        transitionProperty: 'background-color, transform',
        width: '100%',
        ':hover': {
          [CAN_HOVER_MEDIA_QUERY]: {backgroundColor: 'var(--color-space-50)'},
        },
        ':hover [data-download-arrow]': {
          [CAN_HOVER_MEDIA_QUERY]: {transform: 'translateY(2px)'},
        },
        ':active': {transform: 'translateY(1px)'},
        [TWO_COLUMNS_MEDIA_QUERY]: {width: 'auto'},
        [MIN_TABLET_MEDIA_QUERY]: {padding: '8px 30px 8px 22px'},
      })}
    >
      <Download
        size={24}
        style={{flex: 'none'}}
        arrowStyle={{transition: 'transform 150ms'}}
      />
      <span>
        {english ? (
          <FormattedMessage
            description="Link to the PDF of the Accessibility Conformance Report (ACR), drawn as a button, on the English Accessibility page. {size} is the size of the file, like “1 MB”"
            defaultMessage="Download the ACR (PDF, {size})"
            values={{size}}
          />
        ) : (
          <FormattedMessage
            description="Link to the PDF of the Accessibility Conformance Report (ACR), drawn as a button, on the Accessibility page. The report is in English only, so the label says so. {size} is the size of the file, like “1 MB”"
            defaultMessage="Download the ACR (PDF in English, {size})"
            values={{size}}
          />
        )}
      </span>
    </a>
  );
};

// A link to a section of the page, with the Link style and arrow of the Figma
// file.
export const AcrBountyLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  const css = useCSS();
  return (
    <a
      href={href}
      className={css({
        ...MonumentGroteskSemiMono,
        alignItems: 'center',
        color: SPACE,
        display: 'inline-flex',
        fontSize: '16px',
        lineHeight: '28px',
        textDecorationLine: 'none',
        ':hover > span': {
          [CAN_HOVER_MEDIA_QUERY]: {textDecorationThickness: '2px'},
        },
        ':hover > svg': {
          [CAN_HOVER_MEDIA_QUERY]: {transform: 'translateX(3px)'},
        },
      })}
    >
      <span
        className={css({
          textDecorationLine: 'underline',
          textDecorationThickness: '1px',
          textUnderlineOffset: '0.3em',
        })}
      >
        {children}
      </span>
      <RightArrow
        size={24}
        style={{flex: 'none', marginLeft: '6px', transition: 'transform 150ms'}}
      />
    </a>
  );
};
