import nextConfig from 'eslint-config-next'

// eslint-config-next ships a native flat-config array (no legacy .eslintrc
// bridging needed) — spreading it directly avoids the FlatCompat +
// eslint-plugin-react double-instance crash that older Next.js docs'
// `compat.extends('next/core-web-vitals', ...)` recipe triggers on this
// dependency combination.
const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['supabase/**'],
  },
  {
    // eslint-config-next 16.x bundles eslint-plugin-react-hooks v6's new
    // React Compiler rule set, which is considerably stricter than the
    // stable React rules.
    //
    //  - react-hooks/immutability: no longer fires anywhere in this
    //    codebase — the 3 real instances (a function used inside a
    //    useEffect above its own declaration, in admin/layout.tsx,
    //    admin/phones/[id]/page.tsx, admin/settings/page.tsx) were fixed
    //    by wrapping each in useCallback and moving the declaration above
    //    the effect that calls it. Kept at 'warn' defensively: the
    //    pattern this rule flags (calling a function before its
    //    declaration, relying on hoisting) is still a legitimate JS
    //    idiom elsewhere in a codebase this size, so a future instance
    //    should surface as a warning to fix, not silently block a build
    //    as an error.
    //  - react-hooks/set-state-in-effect: fires on ~10 standard
    //    fetch-on-mount call sites (`setLoading(true)` at the top of a
    //    data effect), which is the documented way to drive a loading
    //    state for an async fetch — not "cascading renders" in a bug
    //    sense. These are active, expected warnings, not leftover cruft.
    //
    // Both downgraded to warnings rather than left as build-failing
    // errors, so real regressions are still surfaced without blocking
    // every commit that touches a data-fetching component the same way
    // the rest of the codebase already does.
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
