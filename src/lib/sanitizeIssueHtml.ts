import DOMPurify from "dompurify";

// Issue HTML is server-rendered from escaped content, but html_body is a
// user-writable column, so treat it as untrusted at the sink: strip scripts,
// event handlers, javascript: URLs, forms, iframes, and force safe link targets.
let hooked = false;

export function sanitizeIssueHtml(html: string): string {
  if (typeof window === "undefined") return "";
  if (!hooked) {
    hooked = true;
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer nofollow");
      }
    });
  }
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true, svg: true },
    FORBID_TAGS: ["style", "form", "input", "button", "iframe", "object", "embed", "link", "meta", "base"],
    FORBID_ATTR: ["srcdoc", "formaction"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/(?!\/))/i,
  });
}
