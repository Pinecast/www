import {expect, test, type Page} from '@playwright/test';
import {load, pixelDifference, scrollSettled} from './helpers';

// The "Pause animations" toggle of the header: how its four states look
// (pressed or not, focused or not), and its tooltip (WCAG 1.4.13). Run
// `npm run build` first.

const WIDE = {width: 1280, height: 900};
const NARROW = {width: 375, height: 812};

test.beforeEach(async ({page}) => {
  await page.route(/\.(mp3|mp4|webm)(\?|$)/, route => route.abort());
});

const toggle = (page: Page) =>
  page
    .getByRole('banner')
    .getByRole('button', {name: 'Pause animations'})
    .filter({visible: true});

// The icon and its square, which gets the fill and the focus ring.
const mark = (page: Page) => toggle(page).locator('[data-focus-ring]');

// The tooltip of the toggle. The header holds no other one here: the mute
// tooltip shows only after the sounds load, and these tests block them.
const tooltip = (page: Page) =>
  toggle(page).locator('xpath=..').getByRole('tooltip');

type State = {pressed: boolean; focused: boolean};

// Put the toggle in a state with no pointer on it, and wait for the fade.
async function setState(page: Page, {pressed, focused}: State) {
  const button = toggle(page);
  const reset = async () => {
    await button.evaluate(el => el.blur());
    await page.mouse.move(5, 400);
  };
  await reset();
  if ((await button.getAttribute('aria-pressed')) !== String(pressed)) {
    await button.click();
    await reset();
  }
  if (focused) {
    // After a key press, focus shows a ring, as Tab gives it.
    await page.keyboard.press('Shift');
    await button.focus();
  }
  await expect(button).toHaveAttribute('aria-pressed', String(pressed));
  await page.waitForTimeout(400);
}

const parseColor = (color: string) => {
  const [r, g, b, a = 1] = color.match(/[\d.]+/g)!.map(Number);
  return {r, g, b, a};
};

const luminance = (color: string) => {
  const {r, g, b} = parseColor(color);
  const [lr, lg, lb] = [r, g, b].map(channel => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const STATES: Array<State & {name: string}> = [
  {name: 'not pressed, no focus', pressed: false, focused: false},
  {name: 'not pressed, focus', pressed: false, focused: true},
  {name: 'pressed, no focus', pressed: true, focused: false},
  {name: 'pressed, focus', pressed: true, focused: true},
];

for (const viewport of [WIDE, NARROW]) {
  for (const header of ['light', 'dark'] as const) {
    test(`the four states look different, with the ${header} header at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await load(page, '/');
      if (header === 'dark') {
        // The header takes the colors of the dark section under it.
        await page
          .locator('#analytics')
          .evaluate(anchor => anchor.scrollIntoView({behavior: 'instant'}));
        await scrollSettled(page);
      }

      const shots: Array<Buffer> = [];
      let square:
        {x: number; y: number; width: number; height: number} | undefined;
      let fill = '';
      for (const state of STATES) {
        await setState(page, state);
        const styles = await mark(page).evaluate(el => {
          const style = getComputedStyle(el);
          return {
            background: style.backgroundColor,
            color: style.color,
            outlineStyle: style.outlineStyle,
            outlineWidth: style.outlineWidth,
          };
        });

        // The pressed toggle is filled, with the colors of the header
        // reversed. The focus ring is an outline, and it is the only outline.
        if (state.pressed) {
          expect(parseColor(styles.background).a, state.name).toBe(1);
          expect(
            contrast(styles.color, styles.background),
            `${state.name}: the icon on the fill`,
          ).toBeGreaterThanOrEqual(4.5);
          fill = styles.background;
        } else {
          expect(parseColor(styles.background).a, state.name).toBe(0);
        }
        if (state.focused) {
          expect(styles.outlineStyle, state.name).toBe('solid');
          expect(styles.outlineWidth, state.name).toBe('2px');
        } else {
          expect(styles.outlineStyle, state.name).toBe('none');
        }

        // The toggle does not move or change size.
        const box = (await mark(page).boundingBox())!;
        square ??= box;
        expect([box.width, box.height], state.name).toEqual([
          square.width,
          square.height,
        ]);

        // A picture of the square, with room for the ring.
        shots.push(
          await page.screenshot({
            clip: {
              x: square.x - 10,
              y: square.y - 10,
              width: square.width + 20,
              height: square.height + 20,
            },
          }),
        );
      }

      // The fill follows the header: dark on a light one and light on a dark
      // one.
      expect(luminance(fill) > 0.5, `the fill: ${fill}`).toBe(
        header === 'dark',
      );

      // Each state looks different from each other one.
      for (let i = 0; i < shots.length; i++) {
        for (let j = i + 1; j < shots.length; j++) {
          expect(
            await pixelDifference(page, shots[i], shots[j]),
            `${STATES[i].name} and ${STATES[j].name}`,
          ).toBeGreaterThan(0.05);
        }
      }
    });
  }

  test.describe(`the tooltip at ${viewport.width}px`, () => {
    test.use({viewport});

    test('shows on keyboard focus, says the name, and does not repeat it to a screen reader', async ({
      page,
    }) => {
      await load(page, '/privacy');
      await expect(tooltip(page)).toBeHidden();
      await page.keyboard.press('Shift');
      await toggle(page).focus();
      await expect(tooltip(page)).toBeVisible();
      await expect(tooltip(page)).toHaveText('Pause animations');
      // The tooltip has the name of the button: the button does not point to
      // it, so that the name is not read two times.
      await expect(toggle(page)).toHaveAccessibleName('Pause animations');
      await expect(toggle(page)).toHaveAccessibleDescription('');
      await page.keyboard.press('Tab');
      await expect(tooltip(page)).toBeHidden();
    });

    test('shows on hover, and stays while the pointer moves onto it', async ({
      page,
    }) => {
      await load(page, '/privacy');
      await toggle(page).hover();
      await expect(tooltip(page)).toBeVisible();
      // In the gap between the button and the tooltip, the pointer is on
      // neither of them, and a tooltip that closes there closes. A move in one
      // jump does not see that, so move 1px at a time.
      const from = (await toggle(page).boundingBox())!;
      const to = (await tooltip(page).boundingBox())!;
      const [x0, y0] = [from.x + from.width / 2, from.y + from.height / 2];
      const [x1, y1] = [to.x + to.width / 2, to.y + to.height / 2];
      await page.mouse.move(x0, y0);
      await page.mouse.move(x1, y1, {
        steps: Math.ceil(Math.hypot(x1 - x0, y1 - y0)),
      });
      // Longer than the fade-out, so that a tooltip that closed is hidden.
      await page.waitForTimeout(500);
      await expect(tooltip(page)).toBeVisible();
      // It closes when the pointer leaves both of them.
      await page.mouse.move(viewport.width / 2, viewport.height - 5);
      await expect(tooltip(page)).toBeHidden();
    });

    for (const how of ['focus', 'hover'] as const) {
      test(`Escape hides only the tooltip, with ${how}`, async ({page}) => {
        await load(page, '/privacy');
        // Count the Escape presses that reach the rest of the page. The
        // tooltip takes the ones for it before the page handlers.
        await page.evaluate(() => {
          (window as any).escapes = 0;
          addEventListener('keydown', evt => {
            if (evt.key === 'Escape') {
              (window as any).escapes++;
            }
          });
        });
        const escapes = () => page.evaluate(() => (window as any).escapes);
        const button = toggle(page);
        if (how === 'focus') {
          await page.keyboard.press('Shift');
          await button.focus();
        } else {
          await button.hover();
        }
        await expect(tooltip(page)).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(tooltip(page)).toBeHidden();
        expect(await escapes()).toBe(0);
        // The button keeps its state and its focus.
        await expect(button).toHaveAttribute('aria-pressed', 'false');
        if (how === 'focus') {
          await expect(button).toBeFocused();
        }

        // With no tooltip to hide, Escape goes on to the page.
        await page.keyboard.press('Escape');
        expect(await escapes()).toBe(1);

        // The tooltip stays hidden until the pointer and the focus have both
        // left. It shows again after that.
        await page.mouse.move(viewport.width / 2, viewport.height - 5);
        await button.evaluate(el => el.blur());
        await page.keyboard.press('Shift');
        await button.focus();
        await expect(tooltip(page)).toBeVisible();
      });
    }

    test('does not show when a click gives the button focus', async ({
      page,
    }) => {
      await load(page, '/privacy');
      await toggle(page).click();
      await page.mouse.move(viewport.width / 2, viewport.height - 5);
      await expect(toggle(page)).toBeFocused();
      await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
      await expect(tooltip(page)).toBeHidden();
    });
  });
}
