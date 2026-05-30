export type TimezoneOption = {
  label: string;
  value: "EST" | "AST" | "CST" | "MST" | "PST" | "KST" | "HAST";
  iana: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: "EST - Eastern Standard Time", value: "EST", iana: "America/New_York" },
  { label: "AST - Atlantic Standard Time", value: "AST", iana: "America/Puerto_Rico" },
  { label: "CST - Central Standard Time", value: "CST", iana: "America/Chicago" },
  { label: "MST - Mountain Standard Time", value: "MST", iana: "America/Denver" },
  { label: "PST - Pacific Standard Time", value: "PST", iana: "America/Los_Angeles" },
  { label: "KST - Alaska Standard Time", value: "KST", iana: "America/Anchorage" },
  { label: "HAST - Hawaii-Aleutian Standard Time", value: "HAST", iana: "Pacific/Honolulu" },
];

export const DEFAULT_TIMEZONE_VALUE: TimezoneOption["value"] = "EST";

export const getTimezoneOptionByValue = (value: string): TimezoneOption | undefined =>
  TIMEZONE_OPTIONS.find((option) => option.value === value);

export const getTimezoneOptionByIana = (iana: string): TimezoneOption | undefined =>
  TIMEZONE_OPTIONS.find((option) => option.iana === iana);
