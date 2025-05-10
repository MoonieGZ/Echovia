import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'

const BASE_LANG = 'en'
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'locales')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!
const REPO_OWNER = process.env.REPO_OWNER!
const REPO_NAME = process.env.REPO_NAME!

const octokit = new Octokit({ auth: GITHUB_TOKEN })

function readJSON(file: string) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf-8'))
}

function compareKeys(base: any, compare: any, path: string[] = []): string[] {
  let issues: string[] = []
  for (const key of Object.keys(base)) {
    if (!(key in compare)) {
      issues.push([...path, key].join('.'))
    } else if (
      typeof base[key] === 'object' &&
      base[key] !== null &&
      typeof compare[key] === 'object'
    ) {
      issues = issues.concat(compareKeys(base[key], compare[key], [...path, key]))
    }
  }
  return issues
}

async function findExistingIssue(locale: string): Promise<number | null> {
  const title = `Missing translation keys in ${locale}.json`

  const { data: issues } = await octokit.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    labels: 'i18n,auto-generated'
  })

  const match = issues.find(issue => issue.title === title)
  return match ? match.number : null
}

async function createIssue(locale: string, missingKeys: string[]) {
  const title = `Missing translation keys in ${locale}.json`
  const body = `The following keys are missing in \`${locale}.json\`:\n\n` +
    missingKeys.map(key => `- \`${key}\``).join('\n')

  await octokit.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title,
    body,
    labels: ['i18n', 'auto-generated']
  })
}

async function closeIssue(issueNumber: number, locale: string) {
  await octokit.issues.createComment({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: issueNumber,
    body: `✅ The missing keys in \`${locale}.json\` have been resolved. Closing this issue.`
  })

  await octokit.issues.update({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    issue_number: issueNumber,
    state: 'closed'
  })
}

async function run() {
  const base = readJSON(`${BASE_LANG}.json`)
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json') && f !== `${BASE_LANG}.json`)

  for (const file of files) {
    const locale = file.replace('.json', '')
    const compare = readJSON(file)
    const missingKeys = compareKeys(base, compare)
    const existingIssue = await findExistingIssue(locale)

    if (missingKeys.length > 0) {
      console.log(`❌ Missing keys in ${file}:`, missingKeys)
      if (!existingIssue) {
        await createIssue(locale, missingKeys)
      } else {
        console.log(`ℹ️ Issue already exists for ${locale}.json (issue #${existingIssue}).`)
      }
    } else if (existingIssue) {
      console.log(`✅ All keys present in ${file}. Closing issue #${existingIssue}.`)
      await closeIssue(existingIssue, locale)
    } else {
      console.log(`✅ ${file} is fully translated.`)
    }
  }
}

run().catch(err => {
  console.error('Error validating translations:', err)
  process.exit(1)
})
