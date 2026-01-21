import { useState, useRef, useEffect } from "preact/hooks";
import type { FunctionalComponent } from "preact";
import { Upload } from "lucide-preact";

interface DropZoneProps {
  id?: string;
  primaryText?: string;
  secondaryText?: string;
  metaText?: string;
  multiple?: boolean;
  accept?: string;
  iconLabel?: string;
}

export const DropZone: FunctionalComponent<DropZoneProps> = ({
  id,
  primaryText = "Drop files here or click to upload",
  secondaryText = "Files will be automatically removed",
  metaText = "Max upload size: 1 GB",
  multiple = true,
  accept,
  iconLabel = "Upload files",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const componentId =
    id ?? `drop-zone-${Math.random().toString(36).slice(2, 10)}`; // fuck that
  const descriptionId = `${componentId}-description`;

  const emitFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0 || !dropZoneRef.current) return;

    const event = new CustomEvent("files-added", {
      bubbles: true,
      composed: true,
      detail: { files: Array.from(files) },
    });
    dropZoneRef.current.dispatchEvent(event);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      emitFilesAdded(files);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    emitFilesAdded(input.files);
    input.value = "";
  };

  return (
    <div
      id={componentId}
      ref={dropZoneRef}
      class={`drop-zone ${isDragging ? "dragging" : ""}`}
      role="button"
      tabIndex={0}
      aria-describedby={descriptionId}
      data-drop-zone
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onBlur={() => setIsDragging(false)}
    >
      <div class="animated-grid-container" aria-hidden="true">
        <div class="animated-grid"></div>
      </div>

      <div class="drop-icon-wrapper">
        <Upload class="drop-icon">
          <title>{iconLabel}</title>
        </Upload>
      </div>

      <div class="drop-text">
        <p class="drop-text-primary">{primaryText}</p>
        {secondaryText && <p class="drop-text-secondary">{secondaryText}</p>}
        {metaText && (
          <div id={descriptionId} class="drop-text-meta">
            {metaText}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        class="hidden-input"
        type="file"
        multiple={multiple}
        accept={accept}
        aria-hidden="true"
        onChange={handleFileChange}
      />
    </div>
  );
};
