import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';

interface FileListProps {
    id?: string;
    emptyMessage?: string;
    autoScroll?: boolean;
    simulateUploads?: boolean;
    chunkRange?: [number, number];
}

interface FileItem {
    uploadId: string;
    name: string;
    size: number;
    type: string;
    progress: number;
    status: string;
    isComplete: boolean;
    totalChunks: number;
    isExiting?: boolean;
}

export const FileList: FunctionalComponent<FileListProps> = ({
    id,
    emptyMessage = "No files queued... waiting for juice.",
    autoScroll = true,
    simulateUploads = true,
    chunkRange = [40, 80],
}) => {
    const componentId = id ?? `file-list-${Math.random().toString(36).slice(2, 10)}`;
    const [files, setFiles] = useState<FileItem[]>([]);
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const activeUploads = useRef<Map<string, number>>(new Map());

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

    const randomChunkTotal = () => {
        const min = Math.max(1, chunkRange[0] || 1);
        const max = Math.max(min, chunkRange[1] || min);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const removeFile = useCallback((uploadId: string, userInitiated = false) => {
        const interval = activeUploads.current.get(uploadId);
        if (interval) {
            clearInterval(interval);
            activeUploads.current.delete(uploadId);
        }

        // Trigger exit animation
        setFiles(prev => prev.map(f => 
            f.uploadId === uploadId ? { ...f, isExiting: true } : f
        ));

        // Remove after animation
        setTimeout(() => {
            setFiles(prev => {
                const file = prev.find(f => f.uploadId === uploadId);
                if (file && containerRef.current) {
                    containerRef.current.dispatchEvent(
                        new CustomEvent("file-removed", {
                            bubbles: true,
                            composed: true,
                            detail: { uploadId, fileName: file.name, userInitiated },
                        })
                    );
                }
                return prev.filter(f => f.uploadId !== uploadId);
            });
        }, 300);
    }, []);

    const startSimulation = useCallback((uploadId: string, totalChunks: number) => {
        if (!simulateUploads) return;

        let currentChunk = 0;
        const interval = window.setInterval(() => {
            currentChunk += 1;
            const progressRatio = Math.min(currentChunk / totalChunks, 1);

            setFiles(prev => prev.map(f => {
                if (f.uploadId !== uploadId) return f;
                
                const isComplete = progressRatio >= 1;
                if (isComplete) {
                    clearInterval(interval);
                    activeUploads.current.delete(uploadId);
                    
                    if (containerRef.current) {
                        containerRef.current.dispatchEvent(
                            new CustomEvent("file-completed", {
                                bubbles: true,
                                composed: true,
                                detail: { uploadId },
                            })
                        );
                    }
                }

                return {
                    ...f,
                    progress: progressRatio * 100,
                    status: isComplete 
                        ? "Upload Complete" 
                        : `Uploading chunk ${Math.min(currentChunk, totalChunks)}/${totalChunks}`,
                    isComplete
                };
            }));
        }, 50);

        activeUploads.current.set(uploadId, interval);
    }, [simulateUploads]);

    const addFiles = useCallback((newFiles: File[]) => {
        const newItems = newFiles.map(file => {
            const uploadId = crypto.randomUUID();
            const totalChunks = randomChunkTotal();
            
            // Start simulation for this file
            startSimulation(uploadId, totalChunks);

            if (containerRef.current) {
                containerRef.current.dispatchEvent(
                    new CustomEvent("file-added", {
                        bubbles: true,
                        composed: true,
                        detail: {
                            uploadId,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            totalChunks,
                        },
                    })
                );
            }

            return {
                uploadId,
                name: file.name,
                size: file.size,
                type: file.type,
                progress: 0,
                status: "Initializing...",
                isComplete: false,
                totalChunks
            };
        });

        setFiles(prev => [...prev, ...newItems]);
    }, [startSimulation]);

    // Auto-scroll effect
    useEffect(() => {
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [files, autoScroll]);

    // Event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const host = container.closest("[data-upload-card]") ?? container;

        const handleFilesAdded = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.files) {
                addFiles(detail.files);
            }
        };

        const handleClearFiles = () => {
            activeUploads.current.forEach(interval => clearInterval(interval));
            activeUploads.current.clear();
            setFiles([]);
        };

        const handleRemoveFile = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.uploadId) {
                removeFile(detail.uploadId, true);
            }
        };

        host.addEventListener("files-added", handleFilesAdded);
        container.addEventListener("clear-files", handleClearFiles);
        container.addEventListener("remove-file", handleRemoveFile);

        return () => {
            host.removeEventListener("files-added", handleFilesAdded);
            container.removeEventListener("clear-files", handleClearFiles);
            container.removeEventListener("remove-file", handleRemoveFile);
            activeUploads.current.forEach(interval => clearInterval(interval));
        };
    }, [addFiles, removeFile]);

    return (
        <section
            id={componentId}
            ref={containerRef}
            class="file-list-container"
            data-file-list
            aria-live="polite"
        >
            <div class="scroll-element scroll-cover-top" aria-hidden="true"></div>
            <div class="scroll-element sticky-shadow-top" aria-hidden="true"></div>

            <div
                ref={contentRef}
                class="file-list-content"
                role="list"
                aria-label="Queued uploads"
            >
                {files.length === 0 && (
                    <div class="empty-text visible">
                        {emptyMessage}
                    </div>
                )}

                {files.map(file => (
                    <div
                        key={file.uploadId}
                        class={`file-item ${file.isExiting ? 'exiting' : ''}`}
                        data-upload-id={file.uploadId}
                        data-file-name={file.name}
                        role="listitem"
                    >
                        <div class="file-item-header">
                            <div class="file-info-left">
                                <span class="file-name" title={file.name}>{file.name}</span>
                                <span class="file-size">{formatSize(file.size)}</span>
                            </div>
                            <button
                                type="button"
                                class="delete-btn"
                                onClick={() => removeFile(file.uploadId, true)}
                                aria-label={`Remove ${file.name} from queue`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style={{ width: `${file.progress}%` }}></div>
                        </div>
                        <div class="file-status">
                            <div class={`spinner ${file.isComplete ? 'done' : ''}`} aria-hidden="true"></div>
                            <span class="status-text" style={file.isComplete ? { color: '#10b981' } : {}}>
                                {file.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div class="scroll-element sticky-shadow-bottom" aria-hidden="true"></div>
            <div class="scroll-element scroll-cover-bottom" aria-hidden="true"></div>
        </section>
    );
};
