import { useRef, useState, useEffect } from "preact/hooks";
import type { FunctionalComponent, JSX } from "preact";
import { 
  Files, 
  Flag, 
  Ellipsis, 
  Undo2, 
  Moon, 
  Command, 
  Book, 
  CircleHelp, 
  Share, 
  Globe, 
  MessageSquare, 
  Shield, 
  Lock 
} from "lucide-preact";
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
  files: <Files />,
  report: <Flag />,
  more: <Ellipsis />,
  back: <Undo2 />,
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
      icon: <Moon />,
      type: "toggle",
      checked: isDark,
    },
    {
      value: "shortcuts",
      label: "Shortcuts",
      icon: <Command />,
      type: "button",
    },
    {
      value: "docs",
      label: "Docs",
      icon: <Book />,
      type: "button",
    },
    {
      value: "faq",
      label: "FAQ",
      icon: <CircleHelp />,
      type: "button",
    },
    {
      value: "share",
      label: "Share",
      icon: <Share />,
      type: "button",
    },
    {
      value: "language",
      label: "Language",
      icon: <Globe />,
      type: "button",
    },
    { value: "divider", label: "", type: "divider" },
    {
      value: "feedback",
      label: "Feedback",
      icon: <MessageSquare />,
      type: "button",
    },
    {
      value: "terms",
      label: "Terms of service",
      icon: <Shield />,
      type: "button",
    },
    {
      value: "privacy",
      label: "Privacy Policy",
      icon: <Lock />,
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
