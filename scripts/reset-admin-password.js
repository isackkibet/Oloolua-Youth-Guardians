require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env') });
const { neon, neonConfig } = require('@neondatabase/serverless');
const { randomBytes, scryptSync } = require('node:crypto');
const readline = require('node:readline');

function question(prompt, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(prompt, (answer) => { rl.close(); resolve(answer); });
      return;
    }
    process.stdout.write(prompt);
    let value = '';
    const onData = (char) => {
      const s = char.toString('utf8');
      if (s === '\n' || s === '\r') {
        process.stdin.off('data', onData);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdout.write('\n');
        resolve(value);
      } else if (s === '\u007f') {
        value = value.slice(0, -1);
      } else if (s !== '\u0003') {
        value += s;
      }
    };
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onData);
  });
}

(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in .env');
  const email = (process.env.ADMIN_EMAIL || await question('Admin email: ')).trim().toLowerCase();
  const password = process.env.NEW_ADMIN_PASSWORD || await question('New password (10+ chars): ', true);
  if (password.length < 10) throw new Error('Password must be at least 10 characters');
  const salt = randomBytes(16);
  const hash = `scrypt$${salt.toString('base64url')}$${scryptSync(password, salt, 64).toString('base64url')}`;
  if (process.env.NEON_LOCAL_HTTP_PROXY) {
    neonConfig.fetchEndpoint = () => `${process.env.NEON_LOCAL_HTTP_PROXY.replace(/\/$/, '')}/sql`;
  }
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql.query('UPDATE guardian_users SET password_hash = $1 WHERE lower(email) = lower($2) RETURNING id', [hash, email]);
  if (!rows.length) {
    console.error(`No account found for ${email}. Check the email or GUARDIAN_ADMIN_EMAILS.`);
    process.exitCode = 1;
  } else {
    console.log(`Password reset for ${email}. Sign in at /login.`);
  }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
