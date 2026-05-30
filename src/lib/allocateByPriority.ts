/**
 * Allocates total seconds across topics using weighted distribution by priority (1-5).
 * Enforces minimum 20 seconds per topic and ensures sum equals totalSeconds.
 */
export function allocateByPriority(
  totalSeconds: number,
  priorities: Record<string, number>
): Record<string, number> {
  const topics = Object.keys(priorities);
  if (topics.length === 0) return {};

  const totalWeight = topics.reduce((s, t) => s + Math.max(1, priorities[t] ?? 1), 0);
  const result: Record<string, number> = {};

  topics.forEach((t) => {
    const w = Math.max(1, priorities[t] ?? 1);
    const raw = Math.floor((totalSeconds * w) / totalWeight);
    result[t] = Math.max(20, raw);
  });

  let sum = topics.reduce((s, t) => s + result[t], 0);
  let diff = sum - totalSeconds;

  while (diff > 0) {
    const t = topics.find((x) => result[x] > 20);
    if (!t) break;
    result[t] -= 1;
    diff--;
  }
  while (diff < 0) {
    const t = topics[0];
    result[t] += 1;
    diff++;
  }

  return result;
}

/**
 * Infers priority (1-5) from allocated seconds when loading a newsletter.
 * Uses proportional heuristic: priority ≈ (seconds / totalSeconds) * (3 * topicCount).
 */
export function inferPriorityFromSeconds(
  allocatedSeconds: number,
  totalSeconds: number,
  topicCount: number
): number {
  if (totalSeconds <= 0 || topicCount <= 0) return 3;
  const totalWeight = 3 * topicCount;
  const p = Math.round((allocatedSeconds / totalSeconds) * totalWeight);
  return Math.max(1, Math.min(5, p));
}

type AllocateSecondsTopic = {
  topic: string;
  specific_details?: string;
};

type AllocateSecondsInput = {
  topics: AllocateSecondsTopic[];
  readTimeMinutes: number;
};

type AllocatedTopic = AllocateSecondsTopic & {
  allocated_seconds: number;
};

/**
 * Allocates seconds for API payloads with strict backend compatibility:
 * - each topic gets at least 20s
 * - sum always exactly equals readTimeMinutes * 60
 * - if impossible, trims topic count to max feasible
 */
export function allocateSeconds({
  topics,
  readTimeMinutes,
}: AllocateSecondsInput): AllocatedTopic[] {
  const totalSeconds = Math.max(0, Math.floor(readTimeMinutes * 60));
  const minPerTopic = 20;
  const topicCount = topics.length;

  if (topicCount === 0 || totalSeconds === 0) return [];

  if (topicCount * minPerTopic > totalSeconds) {
    const maxTopicCount = Math.floor(totalSeconds / minPerTopic);
    return topics.slice(0, maxTopicCount).map((topic) => ({
      ...topic,
      allocated_seconds: minPerTopic,
    }));
  }

  const baseAllocation = topics.map((topic) => ({
    ...topic,
    allocated_seconds: minPerTopic,
  }));

  let remaining = totalSeconds - topicCount * minPerTopic;
  let i = 0;
  while (remaining > 0) {
    const increment = remaining >= 10 ? 10 : remaining;
    baseAllocation[i % topicCount].allocated_seconds += increment;
    remaining -= increment;
    i++;
  }

  return baseAllocation;
}
