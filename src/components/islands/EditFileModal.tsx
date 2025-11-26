import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent } from "preact";

interface EditFileModalProps {
  id?: string;
  isOpen: boolean;
  fileName: string;
  linkServer: string;
  linkName: string;
  onSave: (data: { linkServer: string; linkName: string }) => void;
  onCancel: () => void;
}

export const EditFileModal: FunctionalComponent<EditFileModalProps> = ({
  id,
  isOpen,
  fileName,
  linkServer,
  linkName,
  onSave,
  onCancel,
}) => {
  const componentId =
    id ?? `edit-file-modal-${Math.random().toString(36).slice(2, 10)}`;
  const defaultServer =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:4321";
  const [localLinkServer, setLocalLinkServer] = useState(
    linkServer || defaultServer,
  );
  const [localLinkName, setLocalLinkName] = useState(linkName);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const previewLink = `${localLinkServer}/${localLinkName}`;

  useEffect(() => {
    setLocalLinkServer(linkServer || defaultServer);
    setLocalLinkName(linkName);
  }, [linkServer, linkName, isOpen]);

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isClosing]);

  const handleCancel = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 200);
  };

  const handleSave = (e: Event) => {
    e.preventDefault();
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onSave({
        linkServer: localLinkServer,
        linkName: localLinkName,
      });
    }, 200);
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      id={componentId}
      ref={modalRef}
      class={`modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${componentId}-title`}
    >
      <div class={`modal-content ${isClosing ? "closing" : ""}`}>
        <div class="modal-header">
          <h2 id={`${componentId}-title`} class="modal-title">
            Edit File
          </h2>
          <button
            type="button"
            class="modal-close"
            onClick={handleCancel}
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} class="modal-form">
          <div class="modal-body">
            <div class="form-field">
              <label htmlFor={`${componentId}-filename`} class="form-label">
                File Name
              </label>
              <input
                id={`${componentId}-filename`}
                type="text"
                class="form-input"
                value={fileName}
                disabled
                aria-describedby={`${componentId}-filename-help`}
              />
              <p id={`${componentId}-filename-help`} class="form-help-text">
                File name cannot be changed
              </p>
            </div>

            <div class="form-field">
              <label htmlFor={`${componentId}-link-server`} class="form-label">
                Link Server
              </label>
              <input
                ref={firstInputRef}
                id={`${componentId}-link-server`}
                type="text"
                class="form-input"
                value={localLinkServer}
                onInput={(e) =>
                  setLocalLinkServer((e.target as HTMLInputElement).value)
                }
                placeholder="e.g., https://example.com"
                required
              />
            </div>

            <div class="form-field">
              <label htmlFor={`${componentId}-link-name`} class="form-label">
                Link Name
              </label>
              <input
                id={`${componentId}-link-name`}
                type="text"
                class="form-input"
                value={localLinkName}
                onInput={(e) =>
                  setLocalLinkName((e.target as HTMLInputElement).value)
                }
                placeholder="e.g., my-file"
                required
              />
            </div>

            <div class="form-field">
              <label class="form-label">Link Preview</label>
              <div class="link-preview">
                <code class="link-preview-text">{previewLink}</code>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="modal-btn modal-btn--secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" class="modal-btn modal-btn--primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
