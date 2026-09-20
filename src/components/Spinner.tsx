export default function Spinner({
  size = 16,
  className = "",
}: {
  size?: 16 | 20;
  className?: string;
}) {
  const dim = size === 20 ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      className={`inline-block rounded-full border-2 border-sky-300 border-t-sky-500 animate-spin dark:border-sky-800 dark:border-t-sky-400 ${dim} ${className}`.trim()}
      aria-hidden
    />
  );
}
