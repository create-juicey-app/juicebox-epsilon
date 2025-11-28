import { useRef, useState, useEffect } from "preact/hooks";
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
      class="lucide lucide-files-icon lucide-files"
    >
      <path d="M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      <path d="M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z" />
      <path d="M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1" />
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
      class="lucide lucide-flag-icon lucide-flag"
    >
      <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
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
      class="lucide lucide-ellipsis-icon lucide-ellipsis"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
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
      class="lucide lucide-undo2-icon lucide-undo-2"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const handleThemeToggle = (value: string, checked: boolean) => {
    setIsDark(checked);
    const root = document.documentElement;
    if (checked) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const moreActionsOptions: SelectOption[] = [
    {
      value: "theme",
      label: "Dark/Light",
      icon: (
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
          class="lucide lucide-moon-icon lucide-moon"
        >
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
        </svg>
      ),
      type: "toggle",
      checked: isDark,
    },
    {
      value: "shortcuts",
      label: "Shortcuts",
      icon: (
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
          class="lucide lucide-command-icon lucide-command"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "docs",
      label: "Docs",
      icon: (
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
          class="lucide lucide-book-icon lucide-book"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "faq",
      label: "FAQ",
      icon: (
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
          class="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "share",
      label: "Share",
      icon: (
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
          class="lucide lucide-share-icon lucide-share"
        >
          <path d="M12 2v13" />
          <path d="m16 6-4-4-4 4" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "language",
      label: "Language",
      icon: (
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
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      type: "button",
    },
    { value: "divider", label: "", type: "divider" },
    {
      value: "feedback",
      label: "Feedback",
      icon: (
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
          class="lucide lucide-message-square-icon lucide-message-square"
        >
          <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "terms",
      label: "Terms of service",
      icon: (
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
          class="lucide lucide-shield-icon lucide-shield"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
      ),
      type: "button",
    },
    {
      value: "privacy",
      label: "Privacy Policy",
      icon: (
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
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      type: "button",
    },
  ];

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
            if (action.id === "more") {
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
                  options={moreActionsOptions}
                  onSelect={(value) =>
                    handleActionClick(
                      { ...action, id: value, label: value },
                      index,
                    )
                  }
                  onToggle={handleThemeToggle}
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
