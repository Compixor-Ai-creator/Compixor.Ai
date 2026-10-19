/**
 * Compixor AI — Client Feedback Frequency Counter
 *
 * Manages the client-side prompt scheduling based on user tool completions.
 * NOTE: As per specifications, this client counter only controls WHEN the prompt
 * is displayed and is NOT used for server-side security or rate limiting.
 */

const STORAGE_KEY_FILES_DONE = 'compixor_files_done';
const STORAGE_KEY_NEXT_PROMPT_AT = 'compixor_next_prompt_at';

export const FILE_DONE_EVENT = 'compixor:file-done';
export const PROMPT_DISMISSED_EVENT = 'compixor:prompt-dismissed';

export function getFilesDoneCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(STORAGE_KEY_FILES_DONE);
    const parsed = parseInt(val || '0', 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

export function incrementFilesDone(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getFilesDoneCount();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY_FILES_DONE, next.toString());
    window.dispatchEvent(new CustomEvent(FILE_DONE_EVENT, { detail: { count: next } }));
    return next;
  } catch {
    return 0;
  }
}

export function shouldShowFeedbackPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const filesDone = getFilesDoneCount();
    if (filesDone < 4) return false;

    const nextPromptAtRaw = localStorage.getItem(STORAGE_KEY_NEXT_PROMPT_AT);
    if (!nextPromptAtRaw) {
      // First prompt eligibility threshold reached
      return true;
    }

    const nextPromptAt = parseInt(nextPromptAtRaw, 10);
    if (isNaN(nextPromptAt)) return true;

    return filesDone >= nextPromptAt;
  } catch {
    return false;
  }
}

export function dismissFeedbackPrompt(): void {
  if (typeof window === 'undefined') return;
  try {
    const filesDone = getFilesDoneCount();
    // Postpone next prompt by 10 completed files
    const nextPromptAt = filesDone + 10;
    localStorage.setItem(STORAGE_KEY_NEXT_PROMPT_AT, nextPromptAt.toString());
    window.dispatchEvent(new CustomEvent(PROMPT_DISMISSED_EVENT, { detail: { nextPromptAt } }));
  } catch {}
}
