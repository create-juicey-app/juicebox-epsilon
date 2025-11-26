import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent } from "preact";
import { EditFileModal } from "./EditFileModal";

interface FileItem {
  id: string;
  fileName: string;
  linkServer: string;
  linkName: string;
  size: number;
  uploadDate: string;
  expiresAt: string;
}

interface UploadedFilesListProps {
  id?: string;
  emptyMessage?: string;
  files?: FileItem[];
}

export const UploadedFilesList: FunctionalComponent<UploadedFilesListProps> = ({
  id,
  emptyMessage = "No uploaded files yet.",
  files: initialFiles = [],
}) => {
  const componentId =
    id ?? `uploaded-files-list-${Math.random().toString(36).slice(2, 10)}`;
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  const formatSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const getFullLink = (file: FileItem) => {
    const server =
      file.linkServer ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:4321");
    return `${server}/${file.linkName}`;
  };

  const handleCopy = async (file: FileItem) => {
    const link = getFullLink(file);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);

      if (containerRef.current) {
        containerRef.current.dispatchEvent(
          new CustomEvent("file-copied", {
            bubbles: true,
            composed: true,
            detail: { fileId: file.id, link },
          }),
        );
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleLinkClick = async (file: FileItem, e: MouseEvent) => {
    e.preventDefault();
    const link = getFullLink(file);

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(link);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);

      // Select the text
      const linkElement = (e.currentTarget as HTMLElement).querySelector(
        ".file-card-link-text",
      );
      if (linkElement) {
        const range = document.createRange();
        range.selectNodeContents(linkElement);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      if (containerRef.current) {
        containerRef.current.dispatchEvent(
          new CustomEvent("file-copied", {
            bubbles: true,
            composed: true,
            detail: { fileId: file.id, link },
          }),
        );
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleEdit = (file: FileItem) => {
    setEditingFile(file);
  };

  const handleSaveEdit = (data: { linkServer: string; linkName: string }) => {
    if (!editingFile) return;

    const updatedFiles = files.map((f) =>
      f.id === editingFile.id
        ? { ...f, linkServer: data.linkServer, linkName: data.linkName }
        : f,
    );

    setFiles(updatedFiles);
    setEditingFile(null);

    if (containerRef.current) {
      containerRef.current.dispatchEvent(
        new CustomEvent("file-edited", {
          bubbles: true,
          composed: true,
          detail: {
            fileId: editingFile.id,
            fileName: editingFile.fileName,
            ...data,
          },
        }),
      );
    }
  };

  const handleDelete = (file: FileItem) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${file.fileName}"?`,
    );
    if (!confirmed) return;

    setFiles((prev) => prev.filter((f) => f.id !== file.id));

    if (containerRef.current) {
      containerRef.current.dispatchEvent(
        new CustomEvent("file-deleted", {
          bubbles: true,
          composed: true,
          detail: { fileId: file.id, fileName: file.fileName },
        }),
      );
    }
  };

  return (
    <section
      id={componentId}
      ref={containerRef}
      class="uploaded-files-list"
      data-uploaded-files-list
      aria-label="Uploaded files"
    >
      <div class="uploaded-files-content">
        {files.length === 0 ? (
          <div class="empty-state">
            <svg
              class="empty-state-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p class="empty-state-text">{emptyMessage}</p>
          </div>
        ) : (
          <div class="files-grid" role="list">
            {files.map((file) => (
              <div
                key={file.id}
                class="file-card"
                data-file-id={file.id}
                role="listitem"
              >
                <div class="file-card-header">
                  <div class="file-card-icon">
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
                      aria-hidden="true"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div class="file-card-info">
                    <h3 class="file-card-name" title={file.fileName}>
                      {file.fileName}
                    </h3>
                    <p class="file-card-meta">
                      {formatSize(file.size)} • {formatDate(file.uploadDate)}
                    </p>
                  </div>
                </div>

                <div
                  class="file-card-link"
                  onClick={(e) => handleLinkClick(file, e)}
                  title="Click to copy and select"
                >
                  <code class="file-card-link-text">{getFullLink(file)}</code>
                </div>

                <div class="file-card-actions">
                  <button
                    type="button"
                    class={`file-action-btn ${copiedId === file.id ? "success" : ""}`}
                    onClick={() => handleCopy(file)}
                    aria-label={`Copy link for ${file.fileName}`}
                    title="Copy link"
                  >
                    {copiedId === file.id ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    class="file-action-btn"
                    onClick={() => handleEdit(file)}
                    aria-label={`Edit ${file.fileName}`}
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="file-action-btn file-action-btn--danger"
                    onClick={() => handleDelete(file)}
                    aria-label={`Delete ${file.fileName}`}
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingFile && (
        <EditFileModal
          isOpen={true}
          fileName={editingFile.fileName}
          linkServer={editingFile.linkServer}
          linkName={editingFile.linkName}
          onSave={handleSaveEdit}
          onCancel={() => setEditingFile(null)}
        />
      )}
    </section>
  );
};
