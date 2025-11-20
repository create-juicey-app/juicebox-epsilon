import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent, JSX } from 'preact';
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
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (value: string) => {
        onSelect(value);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="select-wrapper" ref={wrapperRef}>
            <div
                className="select-trigger"
                onClick={handleToggle}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
            >
                {trigger}
            </div>
            {isOpen && (
                <div
                    className="select-menu"
                    role="listbox"
                    aria-label="Select options"
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="select-option"
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
                                <span className="select-option__icon">
                                    {option.icon}
                                </span>
                            )}
                            <span className="select-option__label">
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}