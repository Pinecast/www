import * as React from 'react';
import {Body4, Caption, H2, Subhead, Link as ProseLink} from './Typography';
import {useCSS} from '@/hooks/useCSS';
import {MIN_TABLET_MEDIA_QUERY, MOBILE_MEDIA_QUERY} from '@/constants';
import {SecondaryButton} from './SecondaryButton';
import {useDarkSection} from '@/hooks/useDarkSection';
import {PrimaryButton} from './PrimaryButton';

export const TunedIn = () => {
  const css = useCSS();

  const sectionRef = React.useRef<HTMLElement>(null);
  useDarkSection(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="tuned-in"
      className={css({
        backgroundColor: 'var(--color-space)',
        color: 'var(--color-white)',
        cursor: 'default',
        position: 'relative',
        zIndex: 2,
        // marginTop: '0',
        // paddingBottom: '116px',
        // paddingTop: '116px',
      })}
    >
      <div
        className={css({
          textAlign: 'center',
          padding: '264px 0 240px',
          position: 'relative',
          [MIN_TABLET_MEDIA_QUERY]: {
            padding: '260px 0 216px',
          },
        })}
      >
        <div
          className={css({
            display: 'grid',
            gap: '10px',
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            marginBottom: '86px',
            padding: '0 20px',
            position: 'relative',
            width: '100%',
            zIndex: 2,
            [MIN_TABLET_MEDIA_QUERY]: {
              gap: '20px',
              // margin: '260px 0 -6px',
              marginBottom: '-6px',
            },
          })}
        >
          <div
            className={css({
              gridColumnStart: '3',
              gridColumnEnd: '-3',
              // background:'yellow',
              [MIN_TABLET_MEDIA_QUERY]: {
                gridColumnStart: '5',
                gridColumnEnd: '9',
                margin: '0 -20px',
              },
            })}
          >
            <H2 style={{textWrap: 'balance', marginBottom: '30px'}}>
              Tuned-in to your needs
            </H2>
            <Body4
              style={{
                marginTop: '-10px',
                marginRight: 'auto',
                marginBottom: '30px',
                marginLeft: 'auto',
                maxWidth: '32ch',
                [MIN_TABLET_MEDIA_QUERY]: {
                  maxWidth: '36ch',
                },
              }}
            >
              Whether you’re starting out or you are more established we have a
              solution for you.
            </Body4>
          </div>
        </div>
        <div
          className={css({
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            flexDirection: 'column',
            marginBottom: '30px',
            [MOBILE_MEDIA_QUERY]: {
              marginBottom: '16px',
            },
          })}
        >
          <PrimaryButton
            href="https://pinecast.com/signup"
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-space)',
              display: 'grid',
              lineHeight: '1.2',
              maxWidth: '230px',
              minHeight: '48px',
              placeContent: 'center',
            }}
          >
            Start for free
          </PrimaryButton>
          <SecondaryButton
            href="/features"
            style={{
              color: 'var(--color-white)',
              display: 'grid',
              lineHeight: '1.2',
              maxWidth: '230px',
              minHeight: '48px',
              placeContent: 'center',
            }}
          >
            Discover Features
          </SecondaryButton>
        </div>
        <Caption style={{color: 'var(--color-core-accent)'}}>
          No credit card required
        </Caption>
      </div>
      <ul
        className={css({
          color: 'var(--color-space)',
          display: 'grid',
          gap: '20px',
          width: '100%',
          gridTemplateColumns: 'repeat(3, 1fr)',
          listStyleType: 'none',
          margin: '0',
          padding: '0 20px',
        })}
      >
        <li
          className={css({
            backgroundColor: 'var(--color-orchid)',
            borderRadius: '20px',
            minHeight: '708px',
            padding: '20px',
            alignItems: 'flex-end',
            display: 'flex',
          })}
        >
          <header
            className={css({
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              padding: '20px',
              minHeight: '160px',
              width: '100%',
            })}
          >
            <Subhead style={{marginBottom: '16px', maxWidth: '16ch'}}>
              You are just getting started
            </Subhead>
            <ProseLink
              // TODO: Isolate a non-anchor version of Typography's Link
              // so the entire `<li>` can be used as a large click target.
              href="/features"
              style={{
                color: 'inherit',
              }}
            >
              Learn more
            </ProseLink>
          </header>
        </li>
        <li
          className={css({
            backgroundColor: 'var(--color-lime)',
            borderRadius: '20px',
            minHeight: '708px',
            padding: '20px',
            alignItems: 'flex-end',
            display: 'flex',
          })}
        >
          <header
            className={css({
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              padding: '20px',
              minHeight: '160px',
              width: '100%',
            })}
          >
            <Subhead style={{marginBottom: '16px', maxWidth: '16ch'}}>
              You need advanced tools
            </Subhead>
            <ProseLink
              href="/features"
              style={{
                color: 'inherit',
              }}
            >
              Learn more
            </ProseLink>
          </header>
        </li>
        <li
          className={css({
            backgroundColor: 'var(--color-sky)',
            borderRadius: '20px',
            minHeight: '708px',
            padding: '20px',
            alignItems: 'flex-end',
            display: 'flex',
          })}
        >
          <header
            className={css({
              borderRadius: '10px',
              borderStyle: 'solid',
              borderWidth: '1px',
              padding: '20px',
              minHeight: '160px',
              width: '100%',
            })}
          >
            <Subhead style={{marginBottom: '16px', maxWidth: '16ch'}}>
              You are an organization
            </Subhead>
            <ProseLink
              href="/features"
              style={{
                color: 'inherit',
              }}
            >
              Learn more
            </ProseLink>
          </header>
        </li>
      </ul>
    </section>
  );
};
