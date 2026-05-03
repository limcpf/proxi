export function createAttachmentDownloadUrl(attachmentId: string) {
  const path = `/attachments/${encodeURIComponent(attachmentId)}/download`;
  const publicApiBaseUrl = process.env.PROXI_PUBLIC_API_BASE_URL?.replace(
    /\/+$/,
    "",
  );

  return publicApiBaseUrl ? `${publicApiBaseUrl}${path}` : path;
}
