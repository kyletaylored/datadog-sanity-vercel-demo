/**
 * Resolves git metadata for local development.
 * On Vercel, system env vars (VERCEL_GIT_COMMIT_SHA, etc.) are used instead.
 * Falls back gracefully when not in a git repo.
 */

import simpleGit from 'simple-git'

export interface GitMeta {
  sha: string
  branch: string
  repoUrl: string
}

let cached: GitMeta | null = null

export async function getLocalGitMeta(): Promise<GitMeta> {
  if (cached) return cached

  try {
    const git = simpleGit({baseDir: process.cwd(), binary: 'git', maxConcurrentProcesses: 3})
    const [log, branch, remotes] = await Promise.all([
      git.log(['-1', '--format=%H']),
      git.branchLocal(),
      git.getRemotes(true),
    ])

    const sha = log.latest?.hash ?? 'unknown'
    const branchName = branch.current ?? 'unknown'
    const origin = remotes.find((r) => r.name === 'origin')
    const rawUrl = origin?.refs?.fetch ?? ''
    // Normalize SSH → HTTPS and strip .git suffix
    const repoUrl = rawUrl
      .replace(/^git@github\.com:/, 'https://github.com/')
      .replace(/\.git$/, '')

    cached = {sha, branch: branchName, repoUrl}
    return cached
  } catch {
    return {sha: 'unknown', branch: 'unknown', repoUrl: 'unknown'}
  }
}
