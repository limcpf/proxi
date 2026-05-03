export const newEchoDraftKey = "echo:draft:new";

export function echoEditDraftKey(echoId: string) {
  return `echo:draft:${echoId}`;
}

export function echoReplyDraftKey(echoId: string) {
  return `echo:draft:${echoId}:reply`;
}

export function readDraft(key: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(key) ?? "";
}

export function writeDraft(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (value.length === 0) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, value);
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}
