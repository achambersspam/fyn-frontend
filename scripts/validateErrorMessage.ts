import { errorMessage } from "../src/lib/errorMessage";

const cases: Array<{ name: string; input: unknown; expectIncludes?: string; expectExact?: string }> = [
  {
    name: "401 session",
    input: { status: 401, message: "JWT expired" },
    expectExact: "Your session expired. Please sign in again.",
  },
  {
    name: "postgres leak",
    input: { status: 400, message: "PGRST116 permission denied for table profiles" },
    expectExact: "Something went wrong. Please try again.",
  },
  {
    name: "stripe leak",
    input: { status: 400, message: "Invalid API Key provided: sk_live_abc" },
    expectExact: "Something went wrong. Please try again.",
  },
  {
    name: "sql leak",
    input: { status: 500, message: "SELECT * FROM profiles violates row-level" },
    expectExact: "Something went wrong on our end. We've been notified.",
  },
  {
    name: "offline code",
    input: { status: 0, code: "OFFLINE", message: "Failed to fetch" },
    expectExact: "You appear to be offline. Check your connection.",
  },
  {
    name: "quota",
    input: { status: 429, code: "QUOTA_EXHAUSTED", message: "quota" },
    expectExact: "You've used all of this month's instant generations.",
  },
  {
    name: "validation details",
    input: {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: ["At least one topic is required"],
    },
    expectExact: "At least one topic is required",
  },
  {
    name: "tier limit",
    input: { status: 403, code: "TIER_LIMIT", message: "limit" },
    expectExact: "You've reached your plan's limit. Upgrade for more.",
  },
];

let failed = 0;
for (const test of cases) {
  const actual = errorMessage(test.input);
  const ok = test.expectExact ? actual === test.expectExact : actual.includes(test.expectIncludes || "");
  if (!ok) {
    failed += 1;
    console.error(`FAIL ${test.name}: got ${JSON.stringify(actual)}`);
  } else {
    console.log(`PASS ${test.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log("errorMessage tests passed");
