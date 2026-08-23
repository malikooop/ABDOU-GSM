import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createBrowserClient (not the plain @supabase/supabase-js createClient)
// stores the session in cookies instead of localStorage. That's required
// here, not optional: proxy.ts and lib/supabase-server.ts read the
// session from request cookies to decide server-side whether a request
// to /admin is authorized. If the browser client only wrote to
// localStorage, the server would never see a signed-in user — sign-in
// would appear to succeed for a moment, then proxy.ts would immediately
// bounce the very next request straight back to /login, since it has no
// cookie to read. Using the same @supabase/ssr client on both sides is
// what keeps client and server session state in sync.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);