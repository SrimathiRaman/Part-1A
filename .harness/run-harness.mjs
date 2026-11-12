// Deterministic harness runner for Part 1A.
//   node .harness/run-harness.mjs --lock   record hashes of tests + harness files
//   node .harness/run-harness.mjs          run every gate and write evidence
// Gates: G0 integrity, G1 lint, G2 security, G3 unit + contract tests.
// Exit code 0 = PASS, 1 = FAIL. Results are written by this script only.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = path.join(root, 'evidence', 'harness-results');
const lockPath = path.join(root, '.harness', 'integrity.lock.json');
const PROTECTED = ['tests', '.harness', 'eslint.config.mjs', 'vitest.config.mjs'];
const SECRET_PATTERN =
  /(api[_-]?key|secret|passwd|password|token)\s*[:=]\s*['"`][A-Za-z0-9_\-/+=.]{12,}['"`]/i;

function run(command) {
  const result = spawnSync(command, { cwd: root, shell: true, encoding: 'utf8', timeout: 180000 });
  return { exitCode: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function tail(text, max = 4000) {
  return text.length > max ? text.slice(-max) : text;
}

function listFiles(target) {
  const full = path.join(root, target);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [target];
  return fs.readdirSync(full).flatMap(name => listFiles(path.join(target, name)));
}

function hashProtectedFiles() {
  const hashes = {};
  for (const file of PROTECTED.flatMap(listFiles).sort()) {
    const key = file.split(path.sep).join('/');
    if (key === '.harness/integrity.lock.json') continue;
    // Normalise line endings so Windows and Linux checkouts hash the same.
    const content = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
    hashes[key] = createHash('sha256').update(content).digest('hex');
  }
  return hashes;
}

function stripFrames(text) {
  return text.split('\n').filter(line => !/node_modules|<anonymous>/.test(line)).join('\n');
}

function parseJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function eslintFindings(report) {
  return report.flatMap(file => file.messages.map(message => ({
    file: path.relative(root, file.filePath).split(path.sep).join('/'),
    line: message.line,
    rule: message.ruleId || 'syntax-error',
    expected: `No violation of ${message.ruleId || 'JavaScript syntax'}`,
    observed: message.message
  })));
}

function gateIntegrity() {
  const findings = [];
  if (!fs.existsSync(lockPath)) {
    findings.push({
      rule: 'LOCK_MISSING',
      expected: '.harness/integrity.lock.json exists',
      observed: 'No lock file. Run: node .harness/run-harness.mjs --lock'
    });
    return { gate: 'G0-integrity', passed: false, findings };
  }
  const locked = JSON.parse(fs.readFileSync(lockPath, 'utf8')).files;
  const current = hashProtectedFiles();
  for (const file of new Set([...Object.keys(locked), ...Object.keys(current)])) {
    if (locked[file] === current[file]) continue;
    const observed = !current[file] ? 'file deleted' : !locked[file] ? 'file added' : 'file modified';
    findings.push({ file, rule: 'PROTECTED_FILE_CHANGED', expected: 'unchanged since lock', observed });
  }
  return { gate: 'G0-integrity', passed: findings.length === 0, findings };
}

function gateLint() {
  const result = run('npx eslint src tests --format json');
  const report = parseJson(result.stdout);
  if (!report) {
    return {
      gate: 'G1-lint', passed: false, exitCode: result.exitCode,
      findings: [{ rule: 'TOOL_ERROR', expected: 'ESLint runs', observed: tail(result.stderr || result.stdout) }]
    };
  }
  const findings = eslintFindings(report);
  return { gate: 'G1-lint', passed: result.exitCode === 0 && findings.length === 0, exitCode: result.exitCode, findings };
}

function scanSecrets() {
  const findings = [];
  for (const file of listFiles('src')) {
    const lines = fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/);
    lines.forEach((text, index) => {
      if (SECRET_PATTERN.test(text)) {
        findings.push({
          file: file.split(path.sep).join('/'), line: index + 1, rule: 'HARDCODED_SECRET',
          expected: 'No credentials in source', observed: 'Line matches the secret pattern'
        });
      }
    });
  }
  return findings;
}

function gateSecurity() {
  const findings = [];
  const sast = run('npx eslint src --no-config-lookup --config .harness/eslint.security.config.mjs --format json');
  const report = parseJson(sast.stdout);
  if (report) findings.push(...eslintFindings(report));
  else findings.push({ rule: 'TOOL_ERROR', expected: 'ESLint security scan runs', observed: tail(sast.stderr || sast.stdout) });

  findings.push(...scanSecrets());

  const audit = run('npm audit --audit-level=high --json');
  const auditReport = parseJson(audit.stdout);
  const counts = auditReport?.metadata?.vulnerabilities;
  if (!counts) {
    findings.push({ rule: 'TOOL_ERROR', expected: 'npm audit runs', observed: tail(audit.stderr || audit.stdout) });
  } else if (counts.high + counts.critical > 0) {
    findings.push({
      rule: 'NPM_AUDIT', expected: '0 high or critical dependency vulnerabilities',
      observed: `${counts.high} high, ${counts.critical} critical`
    });
  }
  return { gate: 'G2-security', passed: findings.length === 0, findings };
}

function gateTests() {
  const outputFile = path.join(resultsDir, '.vitest-last.json');
  fs.rmSync(outputFile, { force: true });
  const result = run('npx vitest run --reporter=json --outputFile=evidence/harness-results/.vitest-last.json');
  const report = fs.existsSync(outputFile) ? parseJson(fs.readFileSync(outputFile, 'utf8')) : null;
  fs.rmSync(outputFile, { force: true });
  if (!report) {
    return {
      gate: 'G3-tests', passed: false, exitCode: result.exitCode,
      findings: [{ rule: 'TOOL_ERROR', expected: 'Vitest runs', observed: tail(result.stderr || result.stdout) }]
    };
  }
  const findings = [];
  for (const suite of report.testResults) {
    const file = path.relative(root, suite.name).split(path.sep).join('/');
    if (suite.status === 'failed' && suite.assertionResults.length === 0) {
      findings.push({ file, rule: 'SUITE_FAILED_TO_LOAD', expected: 'Test file loads', observed: tail(suite.message || '', 1500) });
    }
    for (const test of suite.assertionResults.filter(item => item.status === 'failed')) {
      findings.push({
        file, test: test.fullName, rule: 'TEST_FAILED',
        expected: 'Assertion holds (see test title for the requirement ID)',
        observed: tail(stripFrames((test.failureMessages || []).join('\n')), 1500)
      });
    }
  }
  if (report.numTotalTests === 0) {
    findings.push({ rule: 'NO_TESTS', expected: 'At least one test executes', observed: '0 tests ran' });
  }
  return {
    gate: 'G3-tests', passed: result.exitCode === 0 && findings.length === 0, exitCode: result.exitCode,
    totals: { total: report.numTotalTests, passed: report.numPassedTests, failed: report.numFailedTests },
    findings
  };
}

function feedbackMarkdown(report) {
  const lines = [`# Harness feedback — run ${report.run} — ${report.result}`, '', `Checked at: ${report.checkedAt}`, ''];
  for (const gate of report.gates.filter(item => !item.passed)) {
    lines.push(`## ${gate.gate} FAILED`, '');
    for (const finding of gate.findings) {
      const where = [finding.file, finding.line].filter(Boolean).join(':');
      lines.push(`- Rule/test: ${finding.test || finding.rule}${where ? ` (${where})` : ''}`);
      lines.push(`  - Expected: ${finding.expected}`);
      lines.push(`  - Observed: ${String(finding.observed).trim().split('\n').join('\n    ')}`);
    }
    lines.push('');
  }
  if (report.result === 'PASS') lines.push('All gates passed. Human review is still required.');
  return lines.join('\n');
}

if (process.argv.includes('--lock')) {
  const files = hashProtectedFiles();
  fs.writeFileSync(lockPath, JSON.stringify({ lockedAt: new Date().toISOString(), files }, null, 2));
  console.log(`Locked ${Object.keys(files).length} protected files.`);
  process.exit(0);
}

fs.mkdirSync(resultsDir, { recursive: true });
const runNumber = fs.readdirSync(resultsDir).filter(name => /^run-\d+\.json$/.test(name)).length + 1;
const runId = String(runNumber).padStart(3, '0');
const gates = [gateIntegrity(), gateLint(), gateSecurity(), gateTests()];
const report = {
  run: runId,
  checkedAt: new Date().toISOString(),
  node: process.version,
  result: gates.every(gate => gate.passed) ? 'PASS' : 'FAIL',
  gates
};

fs.writeFileSync(path.join(resultsDir, `run-${runId}.json`), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(resultsDir, `run-${runId}-feedback.md`), feedbackMarkdown(report));

for (const gate of gates) {
  console.log(`${gate.passed ? 'PASS' : 'FAIL'}  ${gate.gate}  (${gate.findings.length} finding(s))`);
}
console.log(`\nHARNESS RESULT: ${report.result}  ->  evidence/harness-results/run-${runId}.json`);
process.exit(report.result === 'PASS' ? 0 : 1);
