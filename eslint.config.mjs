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
    // stable React rules and flags patterns that are standard and correct
    // in a codebase not opted into the Compiler:
    //  - react-hooks/immutability fires on ordinary function-declaration
    //    hoisting (`useEffect(() => loadData(), [])` above `function
    //    loadData() {...}`), which is valid JS and used throughout this
    //    project's data-fetching components.
    //  - react-hooks/set-state-in-effect fires on the standard
    //    fetch-on-mount pattern (`setLoading(true)` at the top of a data
    //    effect), which is the documented way to drive a loading state
    //    for an async fetch — not "cascading renders" in a bug sense.
    // Downgraded to warnings rather than left as build-failing errors, so
    // real regressions are still surfaced without blocking every commit
    // that touches a data-fetching component the same way the rest of the
    // codebase already does.
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
