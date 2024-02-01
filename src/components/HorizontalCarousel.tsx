import * as React from 'react';
import {useCSS} from '@/hooks/useCSS';
import {useVisibleElements} from '@/hooks/useVisibleElements';

type HorizontalCarouselProps<T> = {
  gap?: number;
  height: number;
  items: T[];
  onChange?: (currentPanelIndex: number) => void;
  renderItem: (props: T) => React.ReactNode;
  scrollSnapAlign?: 'start' | 'center' | 'end';
  width: number;
};

export const HorizontalCarousel = <T extends any>({
  gap = 10,
  height,
  items,
  onChange,
  renderItem,
  scrollSnapAlign = 'center',
  width,
}: HorizontalCarouselProps<T>) => {
  const css = useCSS();
  const scrollRef = React.useRef<HTMLElement>(null);

  const panelsRef = React.useRef<Element[]>([]);
  const addPanelRef = React.useCallback(
    (index: number) => (el: Element | null) => {
      if (el) {
        panelsRef.current[index] = el;
      }
    },
    [],
  );
  const [visiblePanel] = useVisibleElements(panelsRef, {
    root: scrollRef,
    rootMargin: `0% 0% 0% -50%`,
  });

  React.useEffect(() => {
    if (visiblePanel) {
      const currentPanelIndex = panelsRef.current.findIndex(
        el => el === visiblePanel,
      );
      onChange?.(currentPanelIndex);
    }
  }, [onChange, visiblePanel]);

  return (
    <nav
      ref={scrollRef}
      className={css({
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: `${gap}px`,
        margin: '0',
        overflowX: 'scroll',
        overflowY: 'hidden',
        overscrollBehaviorInline: 'contain',
        overscrollBehaviorX: 'contain',
        padding: `${gap}px`,
        position: 'relative',
        scrollbarColor: 'transparent transparent',
        scrollbarWidth: 'none',
        scrollSnapType: 'x mandatory',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        '::-webkit-scrollbar': {
          backgroundColor: 'transparent',
          height: '0',
          width: '0',
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'transparent',
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      })}
    >
      {items.map((item, i) => (
        <div
          key={i}
          ref={addPanelRef(i)}
          className={css({
            flex: `1 0 ${width}px`,
            height: `${height}px`,
            scrollSnapAlign,
          })}
        >
          {renderItem(item)}
        </div>
      ))}
    </nav>
  );
};
