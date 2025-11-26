import { useRef } from "preact/hooks";
import type { FunctionalComponent, JSX } from "preact";
import { Select, type SelectOption } from "./Select";

interface ActionItem {
  id?: string;
  label: string;
  icon?: "files" | "report" | "more" | string;
  description?: string;
  ariaLabel?: string;
  disabled?: boolean;
  selectOptions?: SelectOption[];
}

interface ActionsGridProps {
  id?: string;
  heading?: string;
  actions?: ActionItem[];
  buttonType?: "button" | "submit" | "reset";
}

const defaultActions: ActionItem[] = [
  { id: "files", label: "Files", icon: "files" },
  { id: "report", label: "Report", icon: "report" },
  { id: "more", label: "More...", icon: "more" },
];

const Icons: Record<string, JSX.Element> = {
  files: (
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
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
    </svg>
  ),
  report: (
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
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>
  ),
  more: (
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
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  back: (
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
      aria-hidden="true"
      focusable="false"
    >
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  ),
};

export const ActionsGrid: FunctionalComponent<ActionsGridProps> = ({
  id,
  heading = "Upload actions",
  actions,
  buttonType = "button",
  children,
}) => {
  const componentId =
    id ?? `actions-grid-${Math.random().toString(36).slice(2, 10)}`;
  const gridRef = useRef<HTMLElement>(null);

  const resolvedActions =
    actions && actions.length > 0 ? actions : defaultActions;
  const hasCustomContent =
    children && (Array.isArray(children) ? children.length > 0 : true);

  const handleActionClick = (action: ActionItem, index: number) => {
    if (action.disabled || !gridRef.current) return;

    gridRef.current.dispatchEvent(
      new CustomEvent("action-select", {
        bubbles: true,
        composed: true,
        detail: {
          id: action.id ?? `action-${index}`,
          label: action.label,
          index,
        },
      }),
    );
  };

  const getIcon = (iconName?: string) => {
    const key = iconName ?? "more";
    return Icons[key] ?? Icons.more;
  };

  return (
    <nav
      id={componentId}
      ref={gridRef}
      class="actions-grid"
      aria-label={heading}
      data-actions-grid
    >
      {hasCustomContent
        ? children
        : resolvedActions.map((action, index) => {
            if (action.id === "more" && action.selectOptions) {
              return (
                <Select
                  key={action.id ?? index}
                  trigger={
                    <button
                      type={buttonType}
                      class="action-btn"
                      aria-label={action.ariaLabel ?? action.label}
                      title={action.description ?? action.label}
                      disabled={action.disabled}
                    >
                      <span class="action-btn__icon">
                        {getIcon(action.icon)}
                      </span>
                      <span>{action.label}</span>
                    </button>
                  }
                  options={action.selectOptions}
                  onSelect={(value) =>
                    handleActionClick(
                      { ...action, id: value, label: value },
                      index,
                    )
                  }
                  ariaLabel={action.ariaLabel ?? action.label}
                />
              );
            }
            return (
              <button
                key={action.id ?? index}
                type={buttonType}
                class="action-btn"
                data-action-id={action.id}
                data-action-index={index}
                data-action-label={action.label}
                aria-label={action.ariaLabel ?? action.label}
                title={action.description ?? action.label}
                disabled={action.disabled}
                onClick={() => handleActionClick(action, index)}
              >
                <span class="action-btn__icon">{getIcon(action.icon)}</span>
                <span>{action.label}</span>
              </button>
            );
          })}
    </nav>
  );
};
