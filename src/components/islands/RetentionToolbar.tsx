import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent } from "preact";

interface RetentionToolbarProps {
  id?: string;
  label?: string;
  options?: string[];
  defaultIndex?: number;
  labelIcon?: boolean;
  valuePrefix?: string;
  describedBy?: string;
}

const defaultOptionsList = [
  "30 Minutes",
  " 1 Hour",
  " 6 Hours",
  "12 Hours",
  "24 Hours",
  " 3 Days",
  " 7 Days",
];

const getParts = (opt: string | undefined) => {
  if (!opt) return { number: "", unit: "" };
  // Split on the first space after the number, preserving all leading spaces
  const match = opt.match(/^(\s*\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { number: opt, unit: "" };
  return {
    number: match[1],
    unit: match[2].trimStart(),
  };
};

export const RetentionToolbar: FunctionalComponent<RetentionToolbarProps> = ({
  id,
  label = "Retention",
  options = defaultOptionsList,
  defaultIndex = 4,
  labelIcon = true,
  valuePrefix = "",
  describedBy,
}) => {
  const componentId =
    id ?? `retention-toolbar-${Math.random().toString(36).slice(2, 10)}`;
  const sliderId = `${componentId}-slider`;
  const valueId = `${componentId}-value`;

  const sliderMin = 0;
  const sliderMax = Math.max(options.length - 1, 0);
  const initialIndex = Math.min(Math.max(defaultIndex, sliderMin), sliderMax);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [animating, setAnimating] = useState<{
    prev: number;
    curr: number;
    direction: "up" | "down";
  } | null>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const descriptionId = describedBy ?? valueId;

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const index = Number(target.value);

    if (index !== currentIndex) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const direction = index > currentIndex ? "up" : "down";

      setAnimating((prevAnim) => {
        // If continuing in same direction, keep the original start value
        // to prevent the exiting number from jumping/resetting
        if (prevAnim && prevAnim.direction === direction) {
          return {
            prev: prevAnim.prev,
            curr: index,
            direction,
          };
        }
        return {
          prev: currentIndex,
          curr: index,
          direction,
        };
      });

      setCurrentIndex(index);

      // Reset animation state after transition
      timeoutRef.current = window.setTimeout(() => {
        setAnimating(null);
        timeoutRef.current = null;
      }, 150);
    }

    if (toolbarRef.current) {
      toolbarRef.current.dispatchEvent(
        new CustomEvent("retention-change", {
          bubbles: true,
          composed: true,
          detail: { index, label: options[index] },
        }),
      );
    }
  };

  const prevParts = animating
    ? getParts(options[animating.prev])
    : { number: "", unit: "" };
  const currParts = animating
    ? getParts(options[animating.curr])
    : getParts(options[currentIndex]);
  const unitChanged = animating ? prevParts.unit !== currParts.unit : false;

  // Emit initial value on mount
  useEffect(() => {
    if (toolbarRef.current) {
      toolbarRef.current.dispatchEvent(
        new CustomEvent("retention-change", {
          bubbles: true,
          composed: true,
          detail: { index: currentIndex, label: options[currentIndex] },
        }),
      );
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section
      id={componentId}
      ref={toolbarRef}
      class="retention-toolbar"
      aria-labelledby={`${componentId}-label`}
    >
      <div class="retention-info">
        <div class="retention-label-group">
          {labelIcon && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide retention-icon lucide-clock-icon lucide-clock"
            >
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}

          <label
            id={`${componentId}-label`}
            class="retention-label"
            for={sliderId}
          >
            {label}:
          </label>
        </div>

        <div class="retention-value-container">
          {animating ? (
            <>
              <div
                class="retention-value-wrapper"
                key={`exit-${animating.prev}`}
              >
                <span
                  class={`retention-number animate-${animating.direction}-exit`}
                  style={{ whiteSpace: "pre" }}
                >
                  {valuePrefix}
                  {prevParts.number}
                </span>
                <span
                  class={`retention-unit ${unitChanged ? `animate-${animating.direction}-exit` : ""}`}
                  style={!unitChanged ? { opacity: 0 } : {}}
                >
                  {prevParts.unit}
                </span>
              </div>
              <div
                class="retention-value-wrapper"
                key={`enter-${animating.curr}`}
              >
                <span
                  class={`retention-number animate-${animating.direction}-enter`}
                  style={{ whiteSpace: "pre" }}
                >
                  {valuePrefix}
                  {currParts.number}
                </span>
                <span
                  class={`retention-unit ${unitChanged ? `animate-${animating.direction}-enter` : ""}`}
                >
                  {currParts.unit}
                </span>
              </div>
            </>
          ) : (
            <div class="retention-value-wrapper" key="static">
              <span class="retention-number" style={{ whiteSpace: "pre" }}>
                {valuePrefix}
                {currParts.number}
              </span>
              <span class="retention-unit">{currParts.unit}</span>
            </div>
          )}
        </div>
      </div>

      <div class="slider-wrapper">
        <input
          id={sliderId}
          class="retention-slider"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step="1"
          value={currentIndex}
          onInput={handleInput}
          aria-describedby={descriptionId}
          aria-valuemin={sliderMin}
          aria-valuemax={sliderMax}
          aria-valuenow={currentIndex}
        />

        <div class="slider-ticks" aria-hidden="true">
          {options.map((_, index) => {
            const max = options.length - 1;
            const p = max === 0 ? 0 : index / max;
            // Calculate position to align with native range input thumb center
            // Thumb width: 16px
            // Formula: p * (100% - thumbWidth) + (thumbWidth / 2)
            // We use transform: translateX(-50%) on the tick to center it
            const offset = 10 - p * 16;
            return (
              <div
                class="tick"
                key={index}
                style={{ left: `calc(${p * 100}% + ${offset}px)` }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
