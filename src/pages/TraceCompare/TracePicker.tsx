import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Trace } from '../../types/observability';
import { Icon } from '../../components/ui/Icon';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface TracePickerProps {
  label: string;
  traces: readonly Trace[];
  value: string;
  disabled?: boolean;
  describedBy?: string;
  onChange: (id: string) => void;
}

/** Domain-specific searchable picker. DOM focus stays on the input while options use active-descendant navigation. */
export function TracePicker({
  label,
  traces,
  value,
  disabled,
  describedBy,
  onChange,
}: TracePickerProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const control = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
    maxHeight: number;
  }>({ left: 0, top: 0, width: 0, maxHeight: 320 });
  const selected = traces.find((trace) => trace.id === value);
  const matching = traces.filter((trace) =>
    `${trace.operation} ${trace.id}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  // The empty option always remains available, including when a search has no matches.
  const options: (Trace | undefined)[] = [undefined, ...matching];
  const expanded = open && !disabled;
  const activeIndex = Math.min(active, options.length - 1);

  function openMenu() {
    if (disabled) return;
    setQuery('');
    setActive(Math.max(0, traces.findIndex((trace) => trace.id === value) + 1));
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index]?.id ?? '');
    setOpen(false);
    input.current?.focus();
  }

  useLayoutEffect(() => {
    if (!expanded) return;
    function place() {
      const rect = control.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const below = window.innerHeight - rect.bottom - margin * 2;
      const above = rect.top - margin * 2;
      const upwards = below < 200 && above > below;
      const maxHeight = Math.max(0, Math.min(320, upwards ? above : below));
      const width = Math.min(rect.width, window.innerWidth - margin * 2);
      setPosition({
        width,
        maxHeight,
        left: Math.max(
          margin,
          Math.min(rect.left, window.innerWidth - width - margin),
        ),
        top: upwards ? undefined : rect.bottom + margin,
        bottom: upwards ? window.innerHeight - rect.top + margin : undefined,
      });
    }
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !control.current?.contains(event.target) &&
        !popup.current?.contains(event.target)
      )
        setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [expanded]);

  useEffect(() => {
    if (expanded)
      document
        .getElementById(`${id}-option-${activeIndex}`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [expanded, activeIndex, query, id]);

  return (
    <div className="trace-picker">
      <label htmlFor={id}>{label}</label>
      <div className="trace-picker-control" ref={control}>
        <input
          ref={input}
          id={id}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-expanded={expanded}
          aria-controls={expanded ? `${id}-list` : undefined}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-activedescendant={
            expanded ? `${id}-option-${activeIndex}` : undefined
          }
          data-selected-id={value}
          placeholder={
            expanded
              ? 'Search operation or Trace ID'
              : `Select ${label.toLowerCase()}`
          }
          value={
            expanded
              ? query
              : selected
                ? `${selected.operation} · ${selected.id} · ${selected.status}`
                : ''
          }
          onClick={() => {
            if (!expanded) openMenu();
          }}
          onChange={(event) => {
            setOpen(true);
            setQuery(event.target.value);
            setActive(event.target.value.trim() ? 1 : 0);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Tab') {
              setOpen(false);
              return;
            }
            if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
              event.preventDefault();
              if (!expanded) {
                openMenu();
                return;
              }
              if (event.key === 'Enter') choose(activeIndex);
              else
                setActive(
                  (activeIndex +
                    (event.key === 'ArrowDown' ? 1 : -1) +
                    options.length) %
                    options.length,
                );
            }
            if (expanded && (event.key === 'Home' || event.key === 'End')) {
              event.preventDefault();
              setActive(event.key === 'Home' ? 0 : options.length - 1);
            }
          }}
        />
        <Icon name="chevron" size={16} />
      </div>
      {expanded &&
        createPortal(
          <div ref={popup} className="trace-picker-popup" style={position}>
            <div
              id={`${id}-list`}
              role="listbox"
              aria-label={`${label} options`}
            >
              {options.map((trace, index) => (
                <div
                  key={trace?.id ?? 'clear'}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={(trace?.id ?? '') === value}
                  data-value={trace?.id ?? ''}
                  className={`trace-picker-option ${index === activeIndex ? 'active' : ''}`}
                  onPointerMove={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(index)}
                >
                  {trace ? (
                    <>
                      <strong>{trace.operation}</strong>
                      <span className="trace-picker-meta">
                        <span className="mono">{trace.id}</span>
                        <StatusBadge status={trace.status} />
                      </span>
                    </>
                  ) : (
                    <span>Clear selection</span>
                  )}
                </div>
              ))}
            </div>
            {matching.length === 0 && (
              <p role="status" className="trace-picker-empty">
                No matching runs. Try another search.
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
