import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

// Nothing here is private except the admin panel and the tokenized share links,
// so the site opts every crawler in explicitly rather than staying silent: an
// AI agent that cannot tell "allowed" from "unspecified" errs on the safe side.
const PRIVATE_PATHS = ['/admin', '/login', '/api/', '/*?share=']

// Named groups replace the `*` group for those agents, so they repeat the same
// exclusions. Listed one by one to make the intent readable, not to restrict.
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'meta-externalagent',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_AGENTS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
