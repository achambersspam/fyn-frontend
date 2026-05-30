export type TopicDetailValidationIssue = {
  topic: string;
  message: string;
  problematicPortion?: string;
  enteredDetails?: string;
};
const normalize = (value: string): string =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const TYPED_ENTRY_TOPICS = new Set(["stock market", "crypto news"]);

export const validateTopicDetailsPreflight = (
  topicDetails: Record<string, string>
): TopicDetailValidationIssue[] => {
  const issues: TopicDetailValidationIssue[] = [];
  for (const [topic, rawDetails] of Object.entries(topicDetails)) {
    const details = normalize(rawDetails || "");
    if (!details) continue;
    const topicLower = topic.toLowerCase();
    if (!TYPED_ENTRY_TOPICS.has(topicLower)) {
      continue;
    }

    // Keep typed-entry validation permissive: only block fully non-alphanumeric payloads.
    if (!/[a-z0-9]/i.test(details)) {
      issues.push({
        topic,
        message: "Details need at least one letter or number.",
        problematicPortion: details,
        enteredDetails: details,
      });
    }
  }
  return issues;
};
