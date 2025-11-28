import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent, JSX } from "preact";
export interface SelectOption {
  value: string;
  label: string;
  icon?: JSX.Element;
}

interface SelectProps {
  trigger: JSX.Element;
  options: SelectOption[];
  onSelect: (value: string) => void;
  ariaLabel?: string;
}

export function Select({
  trigger,
  options,
  onSelect,
  ariaLabel = "Select an option",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (isOpen && !isClosing) {
      setIsClosing(true);
      setIsOpening(false);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 350);
    } else if (!isOpen && !isOpening) {
      setIsOpen(true);
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
      }, 700);
    }
  };

  const handleSelect = (value: string) => {
    onSelect(value);
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        !isClosing
      ) {
        setIsClosing(true);
        setIsOpening(false);
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
        }, 350);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, isClosing, isOpen]);

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
      {(isOpen || isClosing) && (
        <div
          className={`select-menu ${isOpening ? "opening" : ""} ${
            isClosing ? "closing" : ""
          }`}
          role="listbox"
          aria-label="Select options"
          data-hovered={isHovered}
          data-closing={isClosing}
        >
          {options.map((option, i) => (
            <div
              key={option.value}
              className="select-option"
              style={{ "--i": i }}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={false}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelect(option.value);
                }
              }}
            >
              {option.icon && (
                <span className="select-option__icon">{option.icon}</span>
              )}
              <span className="select-option__label">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
