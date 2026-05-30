import fs from 'node:fs';
import path from 'node:path';

type ActionAudit = {
  action: string;
  file: string;
  risk: 'low' | 'medium' | 'high';
  reason: string;
  recommendation: string;
  tier: 'easy_frontend' | 'medium_backend' | 'larger_architecture';
};

const targets: Array<{ action: string; file: string; checks: Array<{ pattern: RegExp; reason: string }> }> = [
  {
    action: 'landing_get_started',
    file: 'src/app/page.tsx',
    checks: [
      { pattern: /if\s*\(checking\)\s*return\s+null/i, reason: 'blank-screen auth check before CTA visibility' }
    ]
  },
  {
    action: 'auth_submit',
    file: 'src/app/auth/page.tsx',
    checks: [
      { pattern: /router\.replace\(\"\/dashboard\"\)[\s\S]{0,240}api\.get<Profile>\(\"\/api\/me\"\)/i, reason: 'double navigation + profile fetch path' }
    ]
  },
  {
    action: 'setup_create_newsletter',
    file: 'src/app/setup/components/SetupWizard.tsx',
    checks: [
      { pattern: /supabase\.auth\.getSession\(/i, reason: 'redundant session read before API call' }
    ]
  },
  {
    action: 'creating_first_issue',
    file: 'src/app/setup/creating/page.tsx',
    checks: [
      { pattern: /setInterval\([\s\S]{0,120},\s*1500\)/i, reason: 'tight polling interval can increase load' },
      { pattern: /sessionRetries:\s*5/i, reason: 'high retry counts can delay clicks during transient auth' }
    ]
  },
  {
    action: 'dashboard_load',
    file: 'src/app/dashboard/page.tsx',
    checks: [
      { pattern: /safeNewsletters\.map\(async\s*\(nl\)/i, reason: 'per-newsletter latest fetch fanout risk' }
    ]
  },
  {
    action: 'feedback_vote_submit',
    file: 'src/app/settings/feedback/page.tsx',
    checks: [
      { pattern: /await\s+refreshFeedback\(\)/i, reason: 'full refresh after mutation can add avoidable latency' }
    ]
  }
];

const toAbsolute = (relativePath: string) => path.resolve(process.cwd(), relativePath);

const run = () => {
  const audits: ActionAudit[] = [];
  for (const target of targets) {
    const absolute = toAbsolute(target.file);
    if (!fs.existsSync(absolute)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    for (const check of target.checks) {
      if (!check.pattern.test(source)) continue;
      const tier: ActionAudit['tier'] =
        target.action === 'dashboard_load' || target.action === 'feedback_vote_submit'
          ? 'medium_backend'
          : target.action === 'creating_first_issue'
          ? 'larger_architecture'
          : 'easy_frontend';
      const risk: ActionAudit['risk'] =
        tier === 'larger_architecture' ? 'high' : tier === 'medium_backend' ? 'medium' : 'low';
      audits.push({
        action: target.action,
        file: target.file,
        risk,
        reason: check.reason,
        recommendation:
          tier === 'easy_frontend'
            ? 'remove blocking awaits or dedupe session/profile reads'
            : tier === 'medium_backend'
            ? 'add batched endpoints or avoid full list refetches'
            : 'introduce status-only polling or streamed progress transport',
        tier
      });
    }
  }

  const grouped = {
    easy_frontend: audits.filter((item) => item.tier === 'easy_frontend'),
    medium_backend: audits.filter((item) => item.tier === 'medium_backend'),
    larger_architecture: audits.filter((item) => item.tier === 'larger_architecture')
  };
  const outDir = toAbsolute('scripts/reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'buttonActionLatencyAudit.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalFindings: audits.length,
        grouped
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        outPath,
        totalFindings: audits.length,
        easy: grouped.easy_frontend.length,
        medium: grouped.medium_backend.length,
        large: grouped.larger_architecture.length
      },
      null,
      2
    )
  );
};

run();

