import { projectsApi, FileItem } from '../api/workspace';

export interface PollFileTreeOptions {
  projectId: string;
  currentFiles: FileItem[];
  onUpdate: (files: FileItem[]) => void;
  onApplyingChange?: (isApplying: boolean) => void;
}

/**
 * Polls projectsApi.getFiles with backoff (1s, 2s, 3s, 5s),
 * stopping after about 10-11s or as soon as the file tree changes.
 */
export async function pollFileTreeWithBackoff({
  projectId,
  currentFiles,
  onUpdate,
  onApplyingChange,
}: PollFileTreeOptions): Promise<void> {
  const delays = [1000, 2000, 3000, 5000];
  const initialPaths = new Set(currentFiles.map((f) => f.path));

  if (onApplyingChange) onApplyingChange(true);

  try {
    for (const delay of delays) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const res = await projectsApi.getFiles(projectId);
        const newFiles = res.files || [];
        const hasChanged =
          newFiles.length !== initialPaths.size ||
          newFiles.some((f) => !initialPaths.has(f.path));

        if (hasChanged) {
          onUpdate(newFiles);
          return;
        }
      } catch {
        // Continue next backoff attempt
      }
    }
  } finally {
    if (onApplyingChange) onApplyingChange(false);
  }
}
