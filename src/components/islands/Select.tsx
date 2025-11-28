import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent, JSX } from "preact";

export interface SelectOption {
  value: string;
  label: string;
  icon?: JSX.Element;
  type?: "button" | "divider" | "toggle";
  checked?: boolean;
}

interface SelectProps {
  trigger: JSX.Element;
  options: SelectOption[];
  onSelect: (value: string) => void;
  onToggle?: (value: string, checked: boolean) => void;
  ariaLabel?: string;
}

export function Select({
  trigger,
  options,
  onSelect,
  onToggle,
  ariaLabel = "Select an option",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // detect mobile using matchMedia
  useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(m.matches);
    update();

    // modern addEventListener vs older addListener
    if ("addEventListener" in m) {
      m.addEventListener("change", update);
      return () => m.removeEventListener("change", update);
    } else {
      m.addListener(update as any);
      return () => m.removeListener(update as any);
    }
  }, []);

  // keep scrolling locked on mobile when overlay is visible
  useEffect(() => {
    const root = document.documentElement;
    if (isMobile && (isOpen || isClosing)) {
      root.classList.add("no-scroll");
    } else {
      root.classList.remove("no-scroll");
    }
    return () => {
      root.classList.remove("no-scroll");
    };
  }, [isMobile, isOpen, isClosing]);

  // helper to close menu with animation
  const closeMenu = () => {
    if (isOpening || isClosing) return;
    setIsClosing(true);
    setIsOpening(false);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 350);
  };

  const handleToggle = () => {
    if (isOpening || isClosing) {
      return;
    }
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
      }, 700);
    }
  };

  const handleSelect = (option: SelectOption) => {
    if (isOpening || isClosing) {
      return;
    }
    if (option.type === "toggle" && onToggle) {
      onToggle(option.value, !option.checked);
      // Don't close the menu for toggle
      return;
    }
    onSelect(option.value);
    if (!isClosing) {
      setIsClosing(true);
      setIsOpening(false);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 350);
    }
  };

  useEffect(() => {
    // unified handler for pointer/mouse/touch to cover mobile & desktop.
    // Use capture so it runs before other handlers.
    const handlePointerDown = (event: Event) => {
      if (
        isOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        !isOpening &&
        !isClosing
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === "Escape" || e.key === "Esc")) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("mousedown", handlePointerDown, true);
    document.addEventListener("touchstart", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("mousedown", handlePointerDown, true);
      document.removeEventListener("touchstart", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isClosing, isOpen, isOpening]);

  // drag state kept in ref to avoid re-renders
  const dragRef = useRef({
    dragging: false,
    startY: 0,
    lastY: 0,
    deltaY: 0,
    pointerId: null as number | null,
  });

  // pointer-drag handlers for mobile bottom-sheet
  const onDragStart = (ev: PointerEvent | PointerEvent & any) => {
    if (!isMobile) return;
    // only start drag when sheet is open
    if (!isOpen) return;
    // only initiate on primary pointer (touch / mouse)
    if (ev.button && ev.button !== 0) return;

    dragRef.current.dragging = true;
    dragRef.current.startY = ev.clientY;
    dragRef.current.lastY = ev.clientY;
    dragRef.current.deltaY = 0;
    dragRef.current.pointerId = ev.pointerId ?? null;

    // disable CSS transitions so we can control transform directly while dragging
    if (menuRef.current) {
      menuRef.current.style.transition = "none";
      // ensure we start from 0 translation
      menuRef.current.style.transform = "translateY(0)";
    }

    // ensure overlay is immediately responsive to translucency changes
    if (overlayRef.current) {
      overlayRef.current.style.transition = "none";
    }

    // capture pointer to the current target
    try {
      (ev.target as Element).setPointerCapture?.(ev.pointerId);
    } catch (err) {
      // no-op if not supported
    }
  };

  const onDragMove = (ev: PointerEvent) => {
    if (!dragRef.current.dragging) return;
    if (!isMobile) return;

    const clientY = ev.clientY;
    const start = dragRef.current.startY;
    const delta = Math.max(0, clientY - start); // allow only downward drag
    dragRef.current.deltaY = delta;
    dragRef.current.lastY = clientY;

    // move sheet according to delta
    if (menuRef.current) {
      menuRef.current.style.transform = `translateY(${delta}px)`;
    }
    // lower overlay opacity slightly as sheet goes down
    if (overlayRef.current) {
      const sheetH = menuRef.current?.offsetHeight ?? window.innerHeight;
      const pct = Math.min(1, delta / (sheetH || 400));
      overlayRef.current.style.opacity = `${Math.max(0, 1 - pct * 1)}`;
    }
  };

  const settleAfterDrag = (shouldClose: boolean) => {
    if (!menuRef.current || !overlayRef.current) {
      if (shouldClose) closeMenu();
      return;
    }

    // reset transitions so CSS/TS animates to final state
    menuRef.current.style.transition = "";
    overlayRef.current.style.transition = "";

    if (shouldClose) {
      // Let the CSS 'closing' animation handle slide out, clear any transform
      menuRef.current.style.transform = "";
      overlayRef.current.style.opacity = ""; // let CSS closing animation handle it
      closeMenu();
    } else {
      // Animate back to open position
      menuRef.current.style.transition = "transform 220ms cubic-bezier(.16,1,.3,1)";
      overlayRef.current.style.transition = "opacity 220ms ease";
      menuRef.current.style.transform = "translateY(0)";
      overlayRef.current.style.opacity = "1";

      // Clean up inline styles once transition completes
      const cleanup = () => {
        if (!menuRef.current) return;
        menuRef.current.style.transition = "";
        menuRef.current.style.transform = "";
        menuRef.current.removeEventListener("transitionend", cleanup);
      };
      menuRef.current.addEventListener("transitionend", cleanup);
    }
  };

  const onDragEnd = (ev?: PointerEvent) => {
    if (!dragRef.current.dragging) return;
    if (!isMobile) {
      dragRef.current.dragging = false;
      return;
    }
    const delta = dragRef.current.deltaY;
    dragRef.current.dragging = false;
    dragRef.current.pointerId = null;

    const sheetH = menuRef.current?.offsetHeight ?? window.innerHeight;
    // close threshold: 25% of sheet height or 120px
    const threshold = Math.min(120, sheetH * 0.25);
    const shouldClose = delta > threshold;

    settleAfterDrag(shouldClose);

    try {
      // try to release pointer capture if any
      (ev?.target as Element)?.releasePointerCapture?.(ev?.pointerId);
    } catch {
      // ignore
    }
  };

  // global move/up/cancel listeners only used to monitor active dragging
  useEffect(() => {
    const pm = (e: PointerEvent) => {
      if (dragRef.current.dragging) onDragMove(e);
    };
    const pu = (e: PointerEvent) => {
      if (dragRef.current.dragging) onDragEnd(e);
    };
    document.addEventListener("pointermove", pm);
    document.addEventListener("pointerup", pu);
    document.addEventListener("pointercancel", pu);
    return () => {
      document.removeEventListener("pointermove", pm);
      document.removeEventListener("pointerup", pu);
      document.removeEventListener("pointercancel", pu);
    };
  }, []);

  return (
    <div
      className="select-wrapper"
      ref={wrapperRef}
      data-open={isOpen || isClosing}
      data-hovered={isHovered}
      data-closing={isClosing}
      data-opening={isOpening}
    >
      <div
        className="select-trigger"
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        data-open={isOpen || isClosing}
        data-hovered={isHovered}
        data-closing={isClosing}
        data-opening={isOpening}
      >
        {trigger}
      </div>

      {/* Overlay — only shown on mobile, to block background controls and close menu */}
      {isMobile && (isOpen || isClosing) && (
        <div
          className={`select-overlay ${isOpening ? "opening" : ""} ${
            isClosing ? "closing" : ""
          }`}
          role="presentation"
          aria-hidden="true"
          ref={overlayRef}
          data-opening={isOpening}
          data-closing={isClosing}
          onPointerDown={(e) => {
            // Prevent underlying elements from receiving the click.
            e.stopPropagation();
            e.preventDefault();
            closeMenu();
          }}
        />
      )}

      {(isOpen || isClosing) && (
        <div
          ref={menuRef}
          className={`select-menu ${isOpening ? "opening" : ""} ${
            isClosing ? "closing" : ""
          }`}
          role="listbox"
          aria-label="Select options"
          data-hovered={isHovered}
          data-closing={isClosing}
        >
          {/* Drag handle - visible on mobile only */}
          <div
            className="select-drag-handle"
            role="presentation"
            onPointerDown={onDragStart as any}
          />
          {options.map((option, i) => {
            switch (option.type) {
              case "divider":
                return <div key={i} className="select-option--divider" />;
              case "toggle":
                return (
                  <label
                    key={option.value}
                    className="select-option"
                    style={{ "--i": i }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {option.icon && (
                      <span className="select-option__icon">
                        {option.icon}
                      </span>
                    )}
                    <span className="select-option__label">
                      {option.label}
                    </span>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={option.checked}
                        onChange={() => handleSelect(option)}
                        className="toggle-switch-checkbox"
                      />
                      <div className="toggle-switch-track">
                        <div className="toggle-switch-thumb" />
                      </div>
                    </div>
                  </label>
                );
              default:
                return (
                  <div
                    key={option.value}
                    className="select-option"
                    style={{ "--i": i }}
                    onClick={() => handleSelect(option)}
                    role="option"
                    aria-selected={false}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelect(option);
                      }
                    }}
                  >
                    {option.icon && (
                      <span className="select-option__icon">
                        {option.icon}
                      </span>
                    )}
                    <span className="select-option__label">{option.label}</span>
                  </div>
                );
            }
          })}
        </div>
      )}
    </div>
  );
}
