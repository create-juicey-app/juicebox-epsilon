import { useState, useRef } from "preact/hooks";
import type { FunctionalComponent } from "preact";

interface ReportFormProps {
  id?: string;
  onSubmit?: (data: ReportData) => void;
  onCancel?: () => void;
}

interface ReportData {
  fileUrl: string;
  reason: string;
  details: string;
}

const reportReasons = [
  { value: "", label: "Select a reason..." },
  { value: "malware", label: "Malware or Virus" },
  { value: "illegal", label: "Illegal Content" },
  { value: "copyright", label: "Copyright Infringement" },
  { value: "spam", label: "Spam or Abuse" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
];

export const ReportForm: FunctionalComponent<ReportFormProps> = ({
  id,
  onSubmit,
  onCancel,
}) => {
  const componentId =
    id ?? `report-form-${Math.random().toString(36).slice(2, 10)}`;
  const [fileUrl, setFileUrl] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const fileUrlInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fileUrl.trim()) {
      setError("Please enter a file URL");
      fileUrlInputRef.current?.focus();
      return;
    }

    if (!validateUrl(fileUrl)) {
      setError("Please enter a valid URL");
      fileUrlInputRef.current?.focus();
      return;
    }

    if (!reason) {
      setError("Please select a reason for reporting");
      return;
    }

    setIsSubmitting(true);

    const reportData: ReportData = {
      fileUrl: fileUrl.trim(),
      reason,
      details: details.trim(),
    };

    try {
      // Emit custom event
      if (formRef.current) {
        formRef.current.dispatchEvent(
          new CustomEvent("report-submit", {
            bubbles: true,
            composed: true,
            detail: reportData,
          }),
        );
      }

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(reportData);
      }

      // Reset form
      setTimeout(() => {
        setFileUrl("");
        setReason("");
        setDetails("");
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      setError("Failed to submit report. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFileUrl("");
    setReason("");
    setDetails("");
    setError("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <section
      id={componentId}
      class="report-form-container"
      data-report-form
      aria-labelledby={`${componentId}-title`}
    >
      <div class="report-form-content">
        <div class="report-form-header">
          <h2 id={`${componentId}-title`} class="report-form-title">
            Report a File
          </h2>
          <p class="report-form-subtitle">
            Help us keep the platform safe by reporting problematic content.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} class="report-form">
          {error && (
            <div class="report-form-error" role="alert">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div class="form-field">
            <label htmlFor={`${componentId}-url`} class="form-label">
              File URL <span class="required">*</span>
            </label>
            <input
              ref={fileUrlInputRef}
              id={`${componentId}-url`}
              type="text"
              class="form-input"
              value={fileUrl}
              onInput={(e) => setFileUrl((e.target as HTMLInputElement).value)}
              placeholder="https://example.com/file123"
              required
              disabled={isSubmitting}
            />
            <p class="form-help-text">
              Paste the full URL of the file you want to report
            </p>
          </div>

          <div class="form-field">
            <label htmlFor={`${componentId}-reason`} class="form-label">
              Reason <span class="required">*</span>
            </label>
            <select
              id={`${componentId}-reason`}
              class="form-select"
              value={reason}
              onChange={(e) => setReason((e.target as HTMLSelectElement).value)}
              required
              disabled={isSubmitting}
            >
              {reportReasons.map((r) => (
                <option key={r.value} value={r.value} disabled={!r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div class="form-field">
            <label htmlFor={`${componentId}-details`} class="form-label">
              Additional Details (Optional)
            </label>
            <textarea
              id={`${componentId}-details`}
              class="form-textarea"
              value={details}
              onInput={(e) =>
                setDetails((e.target as HTMLTextAreaElement).value)
              }
              placeholder="Provide any additional information that might help us investigate..."
              rows={4}
              disabled={isSubmitting}
            />
            <p class="form-help-text">Max 500 characters</p>
          </div>

          <div class="report-form-actions">
            <button
              type="submit"
              class="report-btn report-btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span class="spinner" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>

        <div class="report-form-footer">
          <p class="report-footer-text">
            Reports are reviewed by our team. False reports may result in IP
            blocking.
          </p>
        </div>
      </div>
    </section>
  );
};
