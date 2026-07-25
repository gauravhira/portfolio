// One-time seed: inserts MCQ interview-prep questions into `quiz_questions`.
// Run with: npx tsx scripts/seed-quiz-questions.ts
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) return;
      const key = match[1].trim();
      const value = match[2].trim();
      if (!(key in process.env)) process.env[key] = value;
    });
}

loadEnvLocal();

import { getSupabaseServerClient } from "../lib/supabase-server";

type Difficulty = "easy" | "medium" | "hard";

interface QuizQuestion {
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  source_title: string;
  source_url: string;
  difficulty: Difficulty;
}

const NODE_EVENT_LOOP = "Node.js Event Loop & libuv";
const EXPRESS_MIDDLEWARE = "Express Middleware";
const JWT = "JWT";
const OAUTH = "OAuth 2.0";
const CLOSURES = "Closures";
const DEBOUNCE_THROTTLE = "Debounce vs Throttle";
const CDN_CACHING = "CDN / Edge Caching";
const REST_API = "REST API Design";
const WEBSOCKETS = "WebSockets";
const MONGODB = "MongoDB Indexing & Schema Design";
const POSTGRES = "PostgreSQL Basics";
const AWS_DEPLOY = "AWS EC2 / Nginx / PM2";
const CICD = "CI/CD with GitHub Actions";
const REACT_HOOKS = "React Hooks & Rendering";
const REACT_NATIVE = "React Native / Expo";
const REDIS = "Redis Caching Patterns";
const SYSTEM_DESIGN = "System Design Fundamentals";

const questions: QuizQuestion[] = [
  // ---- Node.js Event Loop & libuv ----
  {
    topic: NODE_EVENT_LOOP,
    question: "Which of the following best describes the Node.js event loop?",
    options: [
      "A single thread that executes JS callbacks in phases, delegating I/O to the OS/libuv thread pool",
      "A pool of OS threads that each run a separate JS interpreter",
      "A garbage collector that runs between HTTP requests",
      "A scheduler exclusive to Express.js",
    ],
    correct_index: 0,
    explanation:
      "Node.js runs JavaScript on a single thread, but I/O operations like file system access and DNS lookups are offloaded to libuv's thread pool so the main thread isn't blocked. The event loop then processes completed callbacks in a defined order of phases (timers, pending callbacks, poll, check, close callbacks).",
    source_title: "Node.js docs — The Node.js Event Loop, Timers, and process.nextTick()",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    difficulty: "easy",
  },
  {
    topic: NODE_EVENT_LOOP,
    question:
      "By default, how many threads does libuv's thread pool use for offloading tasks like fs and crypto operations?",
    options: ["1", "4", "8", "Unlimited, one per request"],
    correct_index: 1,
    explanation:
      "libuv's default thread pool size is 4, though it can be increased via the UV_THREADPOOL_SIZE environment variable (up to 1024). This pool handles blocking operations like filesystem calls, DNS lookups, and some crypto functions.",
    source_title: "Node.js docs — Don't Block the Event Loop",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
    difficulty: "medium",
  },
  {
    topic: NODE_EVENT_LOOP,
    question: "Which environment variable controls the size of libuv's thread pool?",
    options: ["NODE_THREAD_POOL", "UV_THREADPOOL_SIZE", "LIBUV_POOL_SIZE", "NODE_OPTIONS"],
    correct_index: 1,
    explanation:
      "UV_THREADPOOL_SIZE sets the number of threads in libuv's thread pool used for filesystem, DNS, and some crypto operations. It must be set before the pool is first used, since libuv doesn't resize the pool at runtime.",
    source_title: "Node.js docs — Don't Block the Event Loop",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
    difficulty: "medium",
  },
  {
    topic: NODE_EVENT_LOOP,
    question: "In which event loop phase do setImmediate() callbacks run?",
    options: ["Timers phase", "Poll phase", "Check phase", "Close callbacks phase"],
    correct_index: 2,
    explanation:
      "The check phase is dedicated to executing callbacks scheduled via setImmediate(), and it runs immediately after the poll phase completes. This ordering is why setImmediate() callbacks queued inside an I/O callback are guaranteed to run before any setTimeout() callbacks scheduled at the same time.",
    source_title: "Node.js docs — The Node.js Event Loop, Timers, and process.nextTick()",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    difficulty: "hard",
  },
  {
    topic: NODE_EVENT_LOOP,
    question: "What is true about process.nextTick() relative to Promise microtasks in Node.js?",
    options: [
      "process.nextTick() callbacks run after all Promise .then() callbacks",
      "The nextTick queue is fully drained before the Promise microtask queue on each iteration",
      "They run on separate threads",
      "process.nextTick() is deprecated in favor of Promises",
    ],
    correct_index: 1,
    explanation:
      "Node.js processes the process.nextTick() queue to completion before processing the Promise microtask queue, at each transition point in the event loop. This means nextTick callbacks queued during a nextTick callback will still run before any pending Promise reactions.",
    source_title: "Node.js docs — The Node.js Event Loop, Timers, and process.nextTick()",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
    difficulty: "hard",
  },
  {
    topic: NODE_EVENT_LOOP,
    question:
      "Which operation is typically offloaded to libuv's thread pool rather than handled by the OS's native async I/O directly?",
    options: ["TCP socket reads", "fs.readFile()", "HTTP request handling", "setTimeout callbacks"],
    correct_index: 1,
    explanation:
      "File system operations like fs.readFile() are offloaded to libuv's thread pool because most operating systems don't provide a consistent async filesystem API. Network I/O (like TCP sockets), by contrast, generally uses the OS's native async mechanisms without needing the thread pool.",
    source_title: "Node.js docs — Don't Block the Event Loop",
    source_url: "https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop",
    difficulty: "easy",
  },

  // ---- Express Middleware ----
  {
    topic: EXPRESS_MIDDLEWARE,
    question: "What is Express middleware?",
    options: [
      "A database connector",
      "A function with access to (req, res, next) that can execute code, modify req/res, and pass control to the next handler",
      "A templating engine",
      "A build tool for bundling assets",
    ],
    correct_index: 1,
    explanation:
      "Express middleware functions have access to the request object, response object, and the next() function in the application's request-response cycle. They can execute any code, make changes to req/res, end the cycle, or call next() to pass control to the next middleware.",
    source_title: "Express docs — Using middleware",
    source_url: "https://expressjs.com/en/guide/using-middleware.html",
    difficulty: "easy",
  },
  {
    topic: EXPRESS_MIDDLEWARE,
    question: "What happens if a middleware function never calls next() and doesn't end the response?",
    options: [
      "Express automatically calls next() after 5 seconds",
      "The request hangs and the client never receives a response",
      "Express throws a compile-time error",
      "The next middleware runs anyway",
    ],
    correct_index: 1,
    explanation:
      "If a middleware neither calls next() nor sends a response (e.g. via res.send() or res.end()), the request-response cycle stalls and the client's request will hang until it times out. Express has no automatic fallback for this.",
    source_title: "Express docs — Using middleware",
    source_url: "https://expressjs.com/en/guide/using-middleware.html",
    difficulty: "medium",
  },
  {
    topic: EXPRESS_MIDDLEWARE,
    question: "How does Express distinguish an error-handling middleware from regular middleware?",
    options: [
      "By its function name",
      "By having exactly four arguments (err, req, res, next)",
      "By being registered with app.error()",
      "By returning a Promise",
    ],
    correct_index: 1,
    explanation:
      "Express identifies error-handling middleware specifically by its arity — a function with four arguments (err, req, res, next). Even if unused, all four parameters must be declared for Express to recognize it as an error handler.",
    source_title: "Express docs — Error handling",
    source_url: "https://expressjs.com/en/guide/error-handling.html",
    difficulty: "medium",
  },
  {
    topic: EXPRESS_MIDDLEWARE,
    question: "Where should error-handling middleware be placed in an Express app?",
    options: [
      "Before all route definitions",
      "After all other app.use() and route calls",
      "It doesn't matter",
      "Inside each route handler only",
    ],
    correct_index: 1,
    explanation:
      "Error-handling middleware must be defined last, after other app.use() and route calls, so Express can correctly route errors passed via next(err) to it. Middleware defined after an error handler won't be reached once an error occurs.",
    source_title: "Express docs — Error handling",
    source_url: "https://expressjs.com/en/guide/error-handling.html",
    difficulty: "medium",
  },
  {
    topic: EXPRESS_MIDDLEWARE,
    question: "Which method mounts middleware for all HTTP methods on a given path in Express?",
    options: ["app.get()", "app.use()", "app.route()", "app.all() only"],
    correct_index: 1,
    explanation:
      "app.use() mounts middleware at a specified path (or globally if no path is given) and applies to all HTTP methods, unlike app.get()/app.post() which are method-specific. It's the primary way to register application-level middleware in Express.",
    source_title: "Express docs — Using middleware",
    source_url: "https://expressjs.com/en/guide/using-middleware.html",
    difficulty: "easy",
  },

  // ---- JWT ----
  {
    topic: JWT,
    question: "A JWT consists of three parts separated by periods. What are they?",
    options: ["Header, Payload, Signature", "Header, Body, Footer", "Key, Value, Hash", "Issuer, Subject, Audience"],
    correct_index: 0,
    explanation:
      "A JSON Web Token is composed of a Base64Url-encoded Header (algorithm & token type), Payload (claims), and Signature, joined by periods as header.payload.signature. The signature is what allows the receiver to verify the token hasn't been tampered with.",
    source_title: "jwt.io — Introduction to JSON Web Tokens",
    source_url: "https://jwt.io/introduction",
    difficulty: "easy",
  },
  {
    topic: JWT,
    question: "Is the payload of a standard signed JWT (JWS) encrypted?",
    options: [
      "Yes, always encrypted with AES",
      "No — it's only Base64Url-encoded and can be read by anyone with the token",
      "Only if using RS256",
      "Only the 'sub' claim is encrypted",
    ],
    correct_index: 1,
    explanation:
      "A standard signed JWT only encodes its payload in Base64Url — it is not encrypted, so anyone who obtains the token can decode and read its claims. This is why sensitive data shouldn't be placed in a JWT payload unless using an encrypted variant (JWE).",
    source_title: "jwt.io — Introduction to JSON Web Tokens",
    source_url: "https://jwt.io/introduction",
    difficulty: "medium",
  },
  {
    topic: JWT,
    question: "What does the 'exp' claim in a JWT specify?",
    options: [
      "The token's encryption algorithm",
      "The expiration time after which the token must not be accepted",
      "The number of times the token can be used",
      "The issuing organization",
    ],
    correct_index: 1,
    explanation:
      "The 'exp' (expiration time) claim is a registered claim defined in RFC 7519 that specifies a Unix timestamp after which the JWT must be rejected for processing. It's one of the standard mechanisms for limiting a token's validity window.",
    source_title: "IETF RFC 7519 — JSON Web Token (JWT)",
    source_url: "https://datatracker.ietf.org/doc/html/rfc7519",
    difficulty: "medium",
  },
  {
    topic: JWT,
    question:
      "What is a key security risk of accepting the 'alg' field from a JWT header without restricting expected algorithms server-side?",
    options: [
      "It has no security implications",
      "An attacker could set alg to 'none' or switch RS256 to HS256 to forge a valid-looking token",
      "It only affects token size",
      "It's only a concern for refresh tokens",
    ],
    correct_index: 1,
    explanation:
      "If a server naively trusts the algorithm specified in the token header, an attacker can craft a token with alg set to 'none' or swap an asymmetric algorithm for a symmetric one using the public key as the HMAC secret. Secure implementations must explicitly whitelist accepted algorithms server-side rather than trusting the token's header.",
    source_title: "jwt.io — Introduction to JSON Web Tokens",
    source_url: "https://jwt.io/introduction",
    difficulty: "hard",
  },
  {
    topic: JWT,
    question:
      "Which signing approach lets a server verify a JWT's signature using a public key while only the issuer holds the private key?",
    options: [
      "HS256 (HMAC with a shared secret)",
      "RS256 (RSA asymmetric signing)",
      "Base64 encoding",
      "MD5 hashing",
    ],
    correct_index: 1,
    explanation:
      "RS256 uses RSA asymmetric cryptography — the issuer signs tokens with a private key, and any party with the corresponding public key can verify the signature without being able to forge new tokens. HS256, by contrast, uses a single shared secret for both signing and verification.",
    source_title: "jwt.io — Introduction to JSON Web Tokens",
    source_url: "https://jwt.io/introduction",
    difficulty: "medium",
  },

  // ---- OAuth 2.0 ----
  {
    topic: OAUTH,
    question: "In OAuth 2.0 terminology, what is the 'resource owner'?",
    options: [
      "The API server",
      "The user who owns the data and can grant access to it",
      "The client application",
      "The authorization server",
    ],
    correct_index: 1,
    explanation:
      "The resource owner is typically the end user — the entity capable of granting access to a protected resource. This is distinct from the client (the application requesting access) and the authorization server (which issues tokens after the resource owner consents).",
    source_title: "OAuth.net — OAuth 2.0",
    source_url: "https://oauth.net/2/",
    difficulty: "easy",
  },
  {
    topic: OAUTH,
    question: "Which OAuth 2.0 grant type is recommended for a server-side web app exchanging a code for tokens?",
    options: [
      "Implicit grant",
      "Authorization Code grant",
      "Client Credentials grant",
      "Resource Owner Password Credentials grant",
    ],
    correct_index: 1,
    explanation:
      "The Authorization Code grant is the recommended flow for server-side (confidential) clients: the client receives a short-lived authorization code via redirect, then exchanges it for tokens in a back-channel request using its client secret. This avoids ever exposing tokens directly in the browser's URL.",
    source_title: "OAuth.net — OAuth 2.0",
    source_url: "https://oauth.net/2/",
    difficulty: "medium",
  },
  {
    topic: OAUTH,
    question: "What is the primary purpose of the 'state' parameter in an OAuth 2.0 authorization request?",
    options: [
      "To specify the requested scopes",
      "To prevent CSRF attacks by tying the authorization response back to the original request",
      "To pass the user's password",
      "To set the token's expiration",
    ],
    correct_index: 1,
    explanation:
      "The 'state' parameter is an opaque, unpredictable value the client generates and later validates on the callback, protecting against cross-site request forgery attacks on the authorization flow. If the state returned doesn't match what was sent, the response should be rejected.",
    source_title: "IETF RFC 6749 — The OAuth 2.0 Authorization Framework",
    source_url: "https://datatracker.ietf.org/doc/html/rfc6749",
    difficulty: "medium",
  },
  {
    topic: OAUTH,
    question: "Which grant type is intended for machine-to-machine authentication with no end user involved?",
    options: ["Authorization Code grant", "Implicit grant", "Client Credentials grant", "Device Authorization grant"],
    correct_index: 2,
    explanation:
      "The Client Credentials grant lets a client authenticate directly using its own credentials (client ID and secret) to obtain a token representing the client itself, not a user — suited for server-to-server communication where no resource owner is involved.",
    source_title: "IETF RFC 6749 — The OAuth 2.0 Authorization Framework",
    source_url: "https://datatracker.ietf.org/doc/html/rfc6749",
    difficulty: "medium",
  },
  {
    topic: OAUTH,
    question:
      "Why is the Implicit grant now discouraged in favor of Authorization Code with PKCE, even for single-page apps?",
    options: [
      "It's slower",
      "It returns access tokens directly in the URL fragment, exposing them to browser history/referrer leaks, with no refresh token support",
      "It requires a client secret",
      "It doesn't support scopes",
    ],
    correct_index: 1,
    explanation:
      "The Implicit grant returns the access token directly in the redirect URI fragment, which can leak via browser history, logs, or referrer headers, and it doesn't support refresh tokens. Current best practice recommends Authorization Code with PKCE for public clients like SPAs and mobile apps instead.",
    source_title: "OAuth.net — OAuth 2.0",
    source_url: "https://oauth.net/2/",
    difficulty: "hard",
  },

  // ---- Closures ----
  {
    topic: CLOSURES,
    question: "What is a closure in JavaScript?",
    options: [
      "A function bundled together with references to its surrounding lexical scope",
      "A way to close a database connection",
      "A syntax error",
      "A loop that never terminates",
    ],
    correct_index: 0,
    explanation:
      "A closure is formed when a function retains access to variables from its enclosing lexical scope even after that outer function has returned. This lets inner functions 'remember' the environment in which they were created.",
    source_title: "MDN — Closures",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    difficulty: "easy",
  },
  {
    topic: CLOSURES,
    question:
      "What will this code log?\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
    options: ["0, 1, 2", "3, 3, 3", "0, 0, 0", "undefined three times"],
    correct_index: 1,
    explanation:
      "Because var is function-scoped (not block-scoped), all three closures created by the arrow functions share the same single 'i' variable, which has already reached 3 by the time the timeouts fire. Using 'let' instead would create a new binding of 'i' per iteration, logging 0, 1, 2.",
    source_title: "MDN — Closures",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    difficulty: "medium",
  },
  {
    topic: CLOSURES,
    question: "Why does replacing 'var' with 'let' in a for-loop change closure behavior over the loop variable?",
    options: [
      "let is faster than var",
      "let creates a new binding scoped to each loop iteration, so each closure captures its own copy",
      "let variables are always constants",
      "There is no actual difference",
    ],
    correct_index: 1,
    explanation:
      "'let' is block-scoped, and in a for-loop, the specification creates a fresh lexical binding of the loop variable for each iteration. This means each closure formed inside the loop body captures a distinct variable rather than one shared mutable variable.",
    source_title: "MDN — Closures",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    difficulty: "medium",
  },
  {
    topic: CLOSURES,
    question: "Which common JavaScript pattern relies directly on closures to keep state private?",
    options: [
      "The module pattern (an IIFE returning an object whose methods reference private variables)",
      "JSON.stringify",
      "The for...of loop",
      "Array.prototype.map",
    ],
    correct_index: 0,
    explanation:
      "The module pattern uses an immediately-invoked function expression (IIFE) to create a private scope, then returns an object whose methods form closures over that scope's variables — giving controlled, encapsulated access to otherwise-private state.",
    source_title: "MDN — Closures",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    difficulty: "easy",
  },
  {
    topic: CLOSURES,
    question:
      "In a closure-based counter factory like function makeCounter() { let count = 0; return () => ++count; }, why doesn't 'count' get garbage collected between calls?",
    options: [
      "It's stored in a global variable internally",
      "The returned function retains a live reference to the enclosing scope, keeping 'count' reachable as long as that function exists",
      "JavaScript never garbage collects primitive numbers",
      "It's cached in the JS engine's constant pool",
    ],
    correct_index: 1,
    explanation:
      "As long as a reference to the returned inner function exists, its closure keeps the enclosing scope (including 'count') reachable, so the garbage collector won't reclaim it. Once all references to the closure are dropped, the scope becomes eligible for collection like any other unreachable object.",
    source_title: "MDN — Closures",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
    difficulty: "hard",
  },

  // ---- Debounce vs Throttle ----
  {
    topic: DEBOUNCE_THROTTLE,
    question: "What does debouncing a function do?",
    options: [
      "Runs the function immediately every time it's called",
      "Delays execution until a specified time has passed since the last call, resetting the timer on each new call",
      "Runs the function on a fixed interval regardless of calls",
      "Caches the function's return value",
    ],
    correct_index: 1,
    explanation:
      "Debouncing delays invoking a function until after a pause of a specified wait time has elapsed since the last time it was invoked — each new call resets the timer. This is useful for scenarios like a search-as-you-type input where you only want to fire a request after the user stops typing.",
    source_title: "Lodash docs — debounce",
    source_url: "https://lodash.com/docs/4.17.15#debounce",
    difficulty: "easy",
  },
  {
    topic: DEBOUNCE_THROTTLE,
    question: "What does throttling a function do?",
    options: [
      "Ensures the function runs at most once per specified time interval, regardless of how many times it's called",
      "Prevents the function from ever running twice",
      "Only runs the function on the trailing edge",
      "Is identical to debouncing",
    ],
    correct_index: 0,
    explanation:
      "Throttling ensures a function executes at most once within a given time window, running it immediately (or on a fixed cadence) and ignoring/queuing extra calls until the window passes. This is useful for rate-limiting handlers like scroll or resize events that fire very frequently.",
    source_title: "Lodash docs — throttle",
    source_url: "https://lodash.com/docs/4.17.15#throttle",
    difficulty: "easy",
  },
  {
    topic: DEBOUNCE_THROTTLE,
    question: "Which scenario is a better fit for throttling than debouncing?",
    options: [
      "A search input that should only query after the user stops typing",
      "A scroll event handler that updates a progress bar and should fire periodically while scrolling",
      "A form validation that runs once after the user finishes editing a field",
      "An autosave that waits for the user to pause typing",
    ],
    correct_index: 1,
    explanation:
      "A scroll handler benefits from throttling because you want periodic updates while the event is continuously firing, not just a single call after it stops. Debouncing would delay the update until scrolling completely stops, which isn't useful for a live progress indicator.",
    source_title: "Lodash docs — throttle",
    source_url: "https://lodash.com/docs/4.17.15#throttle",
    difficulty: "medium",
  },
  {
    topic: DEBOUNCE_THROTTLE,
    question: "In lodash's debounce, what does the 'leading' option control?",
    options: [
      "Whether the debounced function is invoked on the leading edge of the timeout, before the wait period, instead of only on the trailing edge",
      "The number of leading zeros in a numeric argument",
      "Whether errors are thrown",
      "The maximum wait time",
    ],
    correct_index: 0,
    explanation:
      "By default, lodash's debounce invokes the function on the trailing edge (after the wait period ends). Setting {leading: true} makes it also (or only, if trailing is false) invoke on the leading edge — immediately on the first call in a burst.",
    source_title: "Lodash docs — debounce",
    source_url: "https://lodash.com/docs/4.17.15#debounce",
    difficulty: "medium",
  },
  {
    topic: DEBOUNCE_THROTTLE,
    question: "What underlying browser/JS timer API do typical debounce and throttle implementations rely on?",
    options: ["requestAnimationFrame only", "setTimeout/clearTimeout", "Web Workers", "setImmediate"],
    correct_index: 1,
    explanation:
      "Most debounce and throttle implementations are built on setTimeout to schedule delayed execution and clearTimeout to cancel/reset a pending call when a new invocation comes in during the wait window. Some throttle variants also track timestamps directly instead of using a timer.",
    source_title: "MDN — setTimeout()",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/API/setTimeout",
    difficulty: "medium",
  },

  // ---- CDN / Edge Caching ----
  {
    topic: CDN_CACHING,
    question:
      "Why is naively caching a full HTML page at a CDN edge risky for a page containing personalized data (like a user's name)?",
    options: [
      "CDNs can't cache HTML at all",
      "A cached response could be served to a different user, leaking one user's personalized content to another",
      "HTML compresses poorly",
      "CDNs don't support HTTPS",
    ],
    correct_index: 1,
    explanation:
      "If a response containing user-specific content is cached and reused for other users' requests, it causes a serious privacy/security bug where one user sees another user's personalized data. This is why personalized responses typically need Cache-Control: private/no-store, or need to separate personalized fragments from the cacheable shell.",
    source_title: "MDN — Cache-Control",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
    difficulty: "medium",
  },
  {
    topic: CDN_CACHING,
    question: "What does the HTTP 'Vary' header do in the context of CDN caching?",
    options: [
      "It tells the CDN to never cache the response",
      "It tells caches that responses may differ based on the specified request header(s), so they must cache separate variants per value",
      "It sets the cache TTL",
      "It forces a redirect",
    ],
    correct_index: 1,
    explanation:
      "The Vary header tells caches (including CDNs) that the response content can differ depending on the value of specified request headers (e.g. Accept-Language, Authorization), so they need to store and serve distinct cached variants per header value rather than a single shared copy.",
    source_title: "MDN — Vary",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary",
    difficulty: "medium",
  },
  {
    topic: CDN_CACHING,
    question: "What's a common architecture pattern for serving personalized content through a CDN while still getting caching benefits?",
    options: [
      "Disable the CDN entirely for the whole site",
      "Cache a static/public shell at the edge and fetch personalized fragments separately (client-side or via short-TTL/uncached calls)",
      "Cache everything with a 1-year TTL regardless of content",
      "Store personalization data in cookies only, ignoring the server",
    ],
    correct_index: 1,
    explanation:
      "A common pattern is to cache the static, non-personalized 'shell' of a page at the CDN edge while fetching truly personalized data separately, often client-side or via short-TTL/uncached API calls. This preserves most of the CDN's caching benefit without leaking user-specific content between users.",
    source_title: "AWS docs — Amazon CloudFront: Introduction",
    source_url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html",
    difficulty: "medium",
  },
  {
    topic: CDN_CACHING,
    question:
      "Which Cache-Control directive indicates a response must not be stored by shared caches like a CDN, though the requesting browser may still cache it?",
    options: ["public", "private", "no-store", "immutable"],
    correct_index: 1,
    explanation:
      "The 'private' directive indicates the response is intended for a single user and must not be stored by shared/intermediate caches (like a CDN), though the user's own browser cache may still store it. 'no-store', by contrast, prevents any caching at all, including by the browser.",
    source_title: "MDN — Cache-Control",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
    difficulty: "easy",
  },
  {
    topic: CDN_CACHING,
    question: "What is a 'cache stampede' (thundering herd) in the context of edge/CDN caching, and what's a common mitigation?",
    options: [
      "Too many CDN edge nodes existing at once, solved by using fewer regions",
      "Many concurrent requests all missing a just-expired cache entry and hammering the origin simultaneously; mitigated with request coalescing or stale-while-revalidate",
      "A DDoS attack on the CDN provider",
      "A CSS rendering bug",
    ],
    correct_index: 1,
    explanation:
      "A cache stampede happens when a popular cached entry expires and a burst of concurrent requests all miss the cache at once, overwhelming the origin server with duplicate regeneration work. Common mitigations include request coalescing (only one request regenerates while others wait) and stale-while-revalidate, which serves stale content while refreshing in the background.",
    source_title: "MDN — Cache-Control",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
    difficulty: "hard",
  },

  // ---- REST API Design ----
  {
    topic: REST_API,
    question: "Which HTTP method is conventionally used to partially update a resource?",
    options: ["GET", "PATCH", "PUT (always)", "DELETE"],
    correct_index: 1,
    explanation:
      "PATCH is intended for partial modifications to a resource, applying only the specified changes, whereas PUT conventionally represents a full replacement of the resource. Both are valid depending on API design, but PATCH is the more precise choice for partial updates.",
    source_title: "MDN — HTTP request methods",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
    difficulty: "easy",
  },
  {
    topic: REST_API,
    question: "What does it mean for an HTTP method to be 'idempotent'?",
    options: [
      "It always returns the same response body",
      "Making the same request multiple times has the same effect as making it once",
      "It doesn't require authentication",
      "It can only be called once per session",
    ],
    correct_index: 1,
    explanation:
      "An idempotent method produces the same server state whether it's called once or many times with identical input — GET, PUT, and DELETE are idempotent, while POST generally is not. This matters for safe retries: a client can safely retry an idempotent request after a timeout without risking duplicate side effects.",
    source_title: "MDN — HTTP request methods",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
    difficulty: "medium",
  },
  {
    topic: REST_API,
    question: "Which status code should a REST API return when a resource is successfully created?",
    options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
    correct_index: 1,
    explanation:
      "201 Created signals that a request succeeded and a new resource was created as a result, and conventionally includes a Location header pointing to the new resource. 200 OK is more appropriate for a generic successful request that isn't specifically a creation.",
    source_title: "MDN — HTTP response status codes",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
    difficulty: "easy",
  },
  {
    topic: REST_API,
    question: "What is the key difference between HTTP status codes 401 and 403?",
    options: [
      "There is no difference",
      "401 means unauthenticated (missing/invalid credentials); 403 means authenticated but not authorized for that resource",
      "401 is for GET requests, 403 is for POST",
      "403 is deprecated in favor of 401",
    ],
    correct_index: 1,
    explanation:
      "401 Unauthorized indicates the request lacks valid authentication credentials at all, while 403 Forbidden means the server understood who's asking but that identity doesn't have permission to access the resource. Mixing these up is a very common REST API design mistake.",
    source_title: "MDN — HTTP response status codes",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
    difficulty: "medium",
  },
  {
    topic: REST_API,
    question: "In REST API versioning, which is a common approach for indicating the API version in a request?",
    options: [
      "Embedding it in the URL path (e.g. /v1/users) or in a custom Accept/media-type header",
      "Only via the request body",
      "It's impossible to version a REST API",
      "Changing the domain name every release",
    ],
    correct_index: 0,
    explanation:
      "Common REST versioning strategies include putting the version in the URL path (e.g. /api/v1/...) or using content negotiation via a custom media type or Accept header. Both are widely used; the URL approach is simpler and more visible, while header-based versioning keeps URLs stable across versions.",
    source_title: "MDN — HTTP request methods",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
    difficulty: "medium",
  },
  {
    topic: REST_API,
    question:
      "Why is it considered bad REST practice to use GET requests to trigger state-changing operations (like deleting a record)?",
    options: [
      "GET requests are slower than POST",
      "GET is defined as a 'safe' method that shouldn't have side effects, and browsers/crawlers/proxies may pre-fetch or cache GET URLs, triggering unintended actions",
      "GET requests can't include query parameters",
      "Browsers block all GET requests to APIs",
    ],
    correct_index: 1,
    explanation:
      "GET is specified as a 'safe' method meant to be read-only with no meaningful side effects on the server. Because browsers, link prefetchers, proxies, and crawlers may automatically follow or cache GET URLs, using GET for destructive actions can cause them to be triggered accidentally and unpredictably.",
    source_title: "MDN — HTTP request methods",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
    difficulty: "hard",
  },

  // ---- WebSockets ----
  {
    topic: WEBSOCKETS,
    question: "What is the main advantage of WebSockets over repeated HTTP polling?",
    options: [
      "WebSockets use less code",
      "A single persistent, full-duplex connection allows the server to push data to the client at any time without repeated request overhead",
      "WebSockets don't require a server",
      "WebSockets are only for images",
    ],
    correct_index: 1,
    explanation:
      "WebSockets establish one long-lived, full-duplex connection over which either side can send messages at any time, avoiding the repeated connection setup and request overhead of polling. This makes them well suited for real-time features like chat or live updates.",
    source_title: "MDN — The WebSocket API",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
    difficulty: "easy",
  },
  {
    topic: WEBSOCKETS,
    question: "How does a WebSocket connection begin?",
    options: [
      "As a UDP handshake",
      "As a regular HTTP request that includes an 'Upgrade: websocket' header, which the server accepts via 101 Switching Protocols",
      "As a raw TCP connection with no HTTP involved",
      "Through a dedicated port 443 exclusively",
    ],
    correct_index: 1,
    explanation:
      "A WebSocket connection starts life as a standard HTTP request containing 'Upgrade: websocket' and 'Connection: Upgrade' headers; if the server supports it, it responds with a 101 Switching Protocols status and the connection is upgraded to the WebSocket protocol. From then on, the same TCP connection carries WebSocket frames instead of HTTP.",
    source_title: "MDN — The WebSocket API",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
    difficulty: "medium",
  },
  {
    topic: WEBSOCKETS,
    question: "Which URL scheme is used for a secure WebSocket connection?",
    options: ["http://", "https://", "ws://", "wss://"],
    correct_index: 3,
    explanation:
      "'wss://' denotes a WebSocket connection secured over TLS, analogous to how 'https://' secures HTTP. Plain 'ws://' connections are unencrypted, similar to plain HTTP.",
    source_title: "MDN — The WebSocket API",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
    difficulty: "medium",
  },
  {
    topic: WEBSOCKETS,
    question: "What official standard defines the WebSocket protocol?",
    options: ["RFC 6455", "RFC 7519", "RFC 6749", "RFC 2616"],
    correct_index: 0,
    explanation:
      "RFC 6455, published in 2011, defines the WebSocket protocol including the opening handshake and the framing format used for messages after the upgrade. RFC 7519 is JWT and RFC 6749 is OAuth 2.0, for comparison.",
    source_title: "IETF RFC 6455 — The WebSocket Protocol",
    source_url: "https://datatracker.ietf.org/doc/html/rfc6455",
    difficulty: "medium",
  },
  {
    topic: WEBSOCKETS,
    question:
      "In a horizontally-scaled app with multiple server instances, why can't a client's WebSocket message always be broadcast to all connected clients by simply iterating that single server's connections?",
    options: [
      "WebSockets can't broadcast at all",
      "Other clients may be connected to a different server instance behind the load balancer, so the message needs to be propagated across instances (e.g. via Redis pub/sub) to reach them",
      "Broadcasting is only possible with a single client",
      "WebSockets automatically synchronize across all servers",
    ],
    correct_index: 1,
    explanation:
      "When multiple server instances sit behind a load balancer, each instance only holds the WebSocket connections it directly accepted — a message from a client on instance A won't reach clients connected to instance B unless something propagates it across instances. A common solution is a shared pub/sub layer (like Redis Pub/Sub) that every instance subscribes to, relaying messages to its own local connections.",
    source_title: "MDN — The WebSocket API",
    source_url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
    difficulty: "hard",
  },

  // ---- MongoDB ----
  {
    topic: MONGODB,
    question: "What is the default index MongoDB creates automatically on every collection?",
    options: [
      "An index on the 'name' field",
      "A unique index on the _id field",
      "A text index on all string fields",
      "No index is created by default",
    ],
    correct_index: 1,
    explanation:
      "MongoDB automatically creates a unique index on the _id field for every collection, since _id serves as the primary key and must be unique. Any other index must be created explicitly based on query patterns.",
    source_title: "MongoDB docs — Indexes",
    source_url: "https://www.mongodb.com/docs/manual/indexes/",
    difficulty: "easy",
  },
  {
    topic: MONGODB,
    question:
      "In MongoDB schema design, when is embedding a related document generally preferred over referencing (normalizing) it?",
    options: [
      "When the related data is large and unbounded, growing without limit",
      "When the related data is accessed together with the parent most of the time and doesn't grow unboundedly (a 'one-to-few' relationship)",
      "Embedding should never be used",
      "Only for arrays of numbers",
    ],
    correct_index: 1,
    explanation:
      "MongoDB's document model favors embedding data that's frequently accessed together and has a bounded, limited size (a 'one-to-few' relationship), since it avoids extra queries/joins. Data that's large, unbounded, or frequently accessed independently is usually better modeled with references between separate collections.",
    source_title: "MongoDB docs — Data Modeling Introduction",
    source_url: "https://www.mongodb.com/docs/manual/core/data-modeling-introduction/",
    difficulty: "medium",
  },
  {
    topic: MONGODB,
    question: "What is a compound index in MongoDB?",
    options: [
      "An index that spans multiple fields in a single index structure",
      "An index that automatically compresses documents",
      "A duplicate of the _id index",
      "An index only usable on capped collections",
    ],
    correct_index: 0,
    explanation:
      "A compound index includes references to multiple fields within a single collection, indexed together in a specified order. The order of fields in a compound index matters a great deal for which queries it can efficiently support.",
    source_title: "MongoDB docs — Indexes",
    source_url: "https://www.mongodb.com/docs/manual/indexes/",
    difficulty: "medium",
  },
  {
    topic: MONGODB,
    question: "Why does field order matter in a MongoDB compound index like { status: 1, createdAt: -1 }?",
    options: [
      "It doesn't matter at all",
      "MongoDB can efficiently use a prefix of the indexed fields for equality/range queries and sorts, so a query filtering only on 'createdAt' generally can't use this index efficiently",
      "Field order only affects storage size, not query performance",
      "The index automatically reorders itself per query",
    ],
    correct_index: 1,
    explanation:
      "A compound index supports queries that use a 'prefix' of its fields in order — so { status: 1, createdAt: -1 } efficiently serves queries filtering on status alone, or status plus createdAt, but not a query that filters only on createdAt without status. This is why the field order should match the actual query patterns of the application.",
    source_title: "MongoDB docs — Indexes",
    source_url: "https://www.mongodb.com/docs/manual/indexes/",
    difficulty: "hard",
  },
  {
    topic: MONGODB,
    question: "What MongoDB tool/command helps you see whether a query is using an index or performing a full collection scan?",
    options: ["db.collection.stats()", "explain() (e.g. cursor.explain())", "db.version()", "db.collection.drop()"],
    correct_index: 1,
    explanation:
      "The explain() method returns detailed execution statistics for a query, including whether it used an index (IXSCAN) or scanned the entire collection (COLLSCAN), and how many documents were examined versus returned. This is the primary tool for diagnosing slow queries and validating index usage.",
    source_title: "MongoDB docs — Indexes",
    source_url: "https://www.mongodb.com/docs/manual/indexes/",
    difficulty: "medium",
  },
  {
    topic: MONGODB,
    question: "What is a common consequence of having too many indexes on a MongoDB collection?",
    options: [
      "Reads become impossible",
      "Write operations slow down, since every insert/update/delete must also update each index",
      "It makes the collection read-only",
      "It has no downside at all",
    ],
    correct_index: 1,
    explanation:
      "Every index must be updated whenever a document is inserted, updated, or deleted, so having many indexes adds overhead to write operations and consumes additional storage/memory. Index design is a tradeoff between read performance and write overhead.",
    source_title: "MongoDB docs — Indexes",
    source_url: "https://www.mongodb.com/docs/manual/indexes/",
    difficulty: "easy",
  },

  // ---- PostgreSQL ----
  {
    topic: POSTGRES,
    question: "Which SQL command is used to create a new index in PostgreSQL?",
    options: ["NEW INDEX", "CREATE INDEX", "ADD INDEX", "MAKE INDEX"],
    correct_index: 1,
    explanation:
      "PostgreSQL uses the standard SQL CREATE INDEX statement to build an index on one or more columns of a table, e.g. CREATE INDEX idx_users_email ON users(email). By default this creates a B-tree index, the most common and versatile index type.",
    source_title: "PostgreSQL docs — CREATE INDEX",
    source_url: "https://www.postgresql.org/docs/current/sql-createindex.html",
    difficulty: "easy",
  },
  {
    topic: POSTGRES,
    question: "What is the default index type created by PostgreSQL's CREATE INDEX when no method is specified?",
    options: ["Hash", "B-tree", "GIN", "BRIN"],
    correct_index: 1,
    explanation:
      "B-tree is PostgreSQL's default index type and handles equality and range queries (<, <=, =, >=, >) efficiently, covering the vast majority of common indexing needs. Other types like GIN, GiST, Hash, and BRIN exist for specialized use cases like full-text search or array containment.",
    source_title: "PostgreSQL docs — CREATE INDEX",
    source_url: "https://www.postgresql.org/docs/current/sql-createindex.html",
    difficulty: "medium",
  },
  {
    topic: POSTGRES,
    question: "What does wrapping several SQL statements in BEGIN ... COMMIT do in PostgreSQL?",
    options: [
      "It has no effect since PostgreSQL auto-commits every statement regardless",
      "It groups the statements into a single transaction, so they either all succeed together or can be rolled back together",
      "It creates a new database",
      "It locks the entire database for all users",
    ],
    correct_index: 1,
    explanation:
      "BEGIN starts an explicit transaction block, and the statements within it are only permanently applied when COMMIT is executed — if an error occurs or ROLLBACK is called instead, all changes within the block are undone. This preserves atomicity for multi-statement operations.",
    source_title: "PostgreSQL docs — Transactions",
    source_url: "https://www.postgresql.org/docs/current/tutorial-transactions.html",
    difficulty: "medium",
  },
  {
    topic: POSTGRES,
    question: "What isolation level does PostgreSQL use by default for transactions?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correct_index: 1,
    explanation:
      "PostgreSQL's default transaction isolation level is Read Committed, meaning each statement within a transaction sees only data committed before that statement began (not before the transaction began). Stricter levels like Repeatable Read and Serializable are available but must be requested explicitly.",
    source_title: "PostgreSQL docs — Transaction Isolation",
    source_url: "https://www.postgresql.org/docs/current/transaction-iso.html",
    difficulty: "hard",
  },
  {
    topic: POSTGRES,
    question: "Which PostgreSQL constraint ensures a column's value must be unique across all rows in a table?",
    options: ["CHECK", "UNIQUE", "DEFAULT", "FOREIGN KEY"],
    correct_index: 1,
    explanation:
      "A UNIQUE constraint ensures that all values in a column (or set of columns) are distinct across the table's rows, rejecting any insert/update that would create a duplicate. PostgreSQL automatically creates a unique index to enforce this constraint.",
    source_title: "PostgreSQL docs — Constraints",
    source_url: "https://www.postgresql.org/docs/current/ddl-constraints.html",
    difficulty: "easy",
  },

  // ---- AWS EC2 / Nginx / PM2 ----
  {
    topic: AWS_DEPLOY,
    question: "What is an Amazon EC2 instance?",
    options: [
      "A managed serverless function",
      "A virtual server ('instance') you provision in the AWS cloud with configurable CPU, memory, and storage",
      "A type of S3 storage bucket",
      "A DNS routing service",
    ],
    correct_index: 1,
    explanation:
      "EC2 (Elastic Compute Cloud) provides resizable virtual machines ('instances') in the cloud, letting you choose instance types with specific vCPU, memory, and network characteristics for your workload. It's one of AWS's foundational IaaS offerings.",
    source_title: "AWS docs — Amazon EC2 User Guide",
    source_url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
    difficulty: "easy",
  },
  {
    topic: AWS_DEPLOY,
    question: "What is a typical role for Nginx in front of a Node.js app running on an EC2 instance?",
    options: [
      "Nginx replaces the need for Node.js entirely",
      "A reverse proxy that terminates TLS/handles static files and forwards dynamic requests to the Node.js process",
      "A database engine",
      "A container orchestrator",
    ],
    correct_index: 1,
    explanation:
      "Nginx is commonly deployed as a reverse proxy in front of a Node.js app: it can terminate HTTPS/TLS, serve static assets directly and efficiently, apply rate limiting/compression, and forward remaining dynamic requests to the Node.js process (often listening on an internal port like 3000). This offloads work Node.js isn't optimized for.",
    source_title: "nginx docs — NGINX Reverse Proxy",
    source_url: "https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/",
    difficulty: "medium",
  },
  {
    topic: AWS_DEPLOY,
    question:
      "Why is a process manager like PM2 commonly used to run a Node.js app in production, rather than just running 'node app.js' directly?",
    options: [
      "PM2 makes JavaScript run faster than V8 alone",
      "PM2 keeps the app running (auto-restarting on crash), supports clustering across CPU cores, and provides monitoring/log management",
      "PM2 replaces the need for a reverse proxy",
      "PM2 is required for Node.js to start at all",
    ],
    correct_index: 1,
    explanation:
      "PM2 is a production process manager that automatically restarts a Node.js app if it crashes, can run the app in cluster mode to utilize multiple CPU cores, and provides built-in logging, monitoring, and zero-downtime reload capabilities. Running 'node app.js' directly gives none of these production resiliency features.",
    source_title: "PM2 docs — Quick Start",
    source_url: "https://pm2.keymetrics.io/docs/usage/quick-start/",
    difficulty: "medium",
  },
  {
    topic: AWS_DEPLOY,
    question: "What does PM2's cluster mode do?",
    options: [
      "Runs the app across multiple separate physical servers automatically",
      "Spawns multiple instances of the Node.js app as worker processes on the same machine, load-balanced across available CPU cores",
      "Groups log files by date",
      "Encrypts traffic between PM2 and the app",
    ],
    correct_index: 1,
    explanation:
      "PM2's cluster mode uses Node.js's built-in cluster module to fork multiple worker processes of the same app, distributing incoming connections across them — letting a single-threaded Node.js app take advantage of multiple CPU cores on one machine. It's a single-server feature, not multi-server orchestration.",
    source_title: "PM2 docs — Cluster Mode",
    source_url: "https://pm2.keymetrics.io/docs/usage/cluster-mode/",
    difficulty: "medium",
  },
  {
    topic: AWS_DEPLOY,
    question:
      "In a typical EC2 + Nginx + PM2 deployment, what is the general request path from an end user to the running Node.js code?",
    options: [
      "User → Node.js directly on port 443, bypassing everything else",
      "User → Nginx (public-facing, handles TLS) → reverse-proxied to a local port → PM2-managed Node.js process handles the request",
      "User → PM2 → Nginx → S3",
      "User → EC2 metadata service → RDS directly",
    ],
    correct_index: 1,
    explanation:
      "The typical flow has Nginx as the public-facing entry point, listening on ports 80/443, terminating TLS and handling static assets, then proxying dynamic requests internally (e.g. to localhost:3000) where PM2 is managing one or more Node.js worker processes. This layered setup separates concerns between the web server, process management, and application code.",
    source_title: "nginx docs — NGINX Reverse Proxy",
    source_url: "https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/",
    difficulty: "hard",
  },
  {
    topic: AWS_DEPLOY,
    question:
      "Which AWS EC2 concept lets you control inbound/outbound traffic rules for an instance, acting like a virtual firewall?",
    options: ["IAM Role", "Security Group", "Elastic IP", "AMI"],
    correct_index: 1,
    explanation:
      "A Security Group acts as a virtual firewall controlling inbound and outbound traffic for one or more EC2 instances, based on rules specifying protocol, port range, and source/destination. It's stateful — if you allow inbound traffic, the corresponding outbound response is automatically allowed.",
    source_title: "AWS docs — Amazon EC2 User Guide",
    source_url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
    difficulty: "easy",
  },

  // ---- CI/CD with GitHub Actions ----
  {
    topic: CICD,
    question: "In GitHub Actions, what is a 'workflow'?",
    options: [
      "A single shell command",
      "An automated process defined by a YAML file in .github/workflows/ that runs one or more jobs in response to events",
      "A GitHub Issue template",
      "A branch protection rule",
    ],
    correct_index: 1,
    explanation:
      "A workflow is a configurable automated process made up of one or more jobs, defined in a YAML file stored in the .github/workflows directory of a repository. Workflows are triggered by events such as a push, pull request, or a schedule.",
    source_title: "GitHub docs — Understanding GitHub Actions",
    source_url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
    difficulty: "easy",
  },
  {
    topic: CICD,
    question: "By default, how do multiple 'jobs' within a single GitHub Actions workflow run relative to each other?",
    options: [
      "Always sequentially, one after another",
      "In parallel, unless dependencies are declared via 'needs'",
      "Only one job can exist per workflow",
      "They run on a random schedule",
    ],
    correct_index: 1,
    explanation:
      "By default, jobs in a workflow run in parallel across separate virtual machines/runners. You can make a job wait for another by adding a 'needs' key referencing the jobs it depends on, forcing sequential execution.",
    source_title: "GitHub docs — Workflow syntax for GitHub Actions",
    source_url: "https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions",
    difficulty: "medium",
  },
  {
    topic: CICD,
    question: "What is a GitHub Actions 'runner'?",
    options: [
      "A person who reviews pull requests",
      "The server (GitHub-hosted or self-hosted) that executes the jobs in a workflow",
      "A type of trigger event",
      "A YAML linter",
    ],
    correct_index: 1,
    explanation:
      "A runner is the server that actually executes a workflow's jobs — GitHub provides hosted runners (Ubuntu, Windows, macOS images) with common tools pre-installed, or you can register your own self-hosted runner for custom environments or hardware.",
    source_title: "GitHub docs — Understanding GitHub Actions",
    source_url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
    difficulty: "medium",
  },
  {
    topic: CICD,
    question: "What is the purpose of GitHub Actions 'secrets'?",
    options: [
      "To store encrypted values (like API keys or deploy credentials) that workflows can reference without exposing them in logs or the repo",
      "To hide entire workflow files from collaborators",
      "To encrypt commit messages",
      "To store public documentation",
    ],
    correct_index: 0,
    explanation:
      "Secrets let you store sensitive values like API tokens, deployment credentials, or private keys encrypted at the repository, environment, or organization level, then reference them in workflows via context expressions like ${{ secrets.MY_TOKEN }}. GitHub Actions automatically redacts secret values from workflow logs.",
    source_title: "GitHub docs — Using secrets in GitHub Actions",
    source_url: "https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions",
    difficulty: "medium",
  },
  {
    topic: CICD,
    question: "In a CI/CD pipeline, what does it typically mean to require 'status checks' to pass before merging a pull request?",
    options: [
      "It has no effect on merging",
      "The workflow's job results (e.g. tests, linting) are reported back to the PR, and branch protection rules can block merging until they succeed",
      "It only affects the commit message format",
      "It automatically deletes the branch",
    ],
    correct_index: 1,
    explanation:
      "Workflows report their job outcomes as status checks on the associated commit/PR, and GitHub's branch protection rules can be configured to require specific checks to pass before allowing a merge. This is how teams enforce that tests, linting, or builds must succeed before code lands on a protected branch like main.",
    source_title: "GitHub docs — Understanding GitHub Actions",
    source_url: "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions",
    difficulty: "hard",
  },

  // ---- React Hooks & Rendering ----
  {
    topic: REACT_HOOKS,
    question: "What does the useState hook return?",
    options: [
      "Only the current state value",
      "An array with the current state value and a function to update it",
      "A Promise resolving to the state",
      "A class instance",
    ],
    correct_index: 1,
    explanation:
      "useState returns a two-element array: the current state value, and a setter function used to update that state and trigger a re-render. It's conventionally destructured as const [state, setState] = useState(initialValue).",
    source_title: "React docs — useState",
    source_url: "https://react.dev/reference/react/useState",
    difficulty: "easy",
  },
  {
    topic: REACT_HOOKS,
    question: "When does a useEffect's cleanup function run?",
    options: [
      "Never",
      "Before the effect re-runs due to a dependency change, and when the component unmounts",
      "Only on the very first render",
      "Only if an error is thrown",
    ],
    correct_index: 1,
    explanation:
      "The function returned from a useEffect callback is the cleanup function — React runs it before re-running the effect due to a dependency change, and also when the component unmounts. This is how you clean up subscriptions, timers, or event listeners set up by the effect.",
    source_title: "React docs — useEffect",
    source_url: "https://react.dev/reference/react/useEffect",
    difficulty: "medium",
  },
  {
    topic: REACT_HOOKS,
    question: "What does passing an empty dependency array ([]) to useEffect mean?",
    options: [
      "The effect runs on every render",
      "The effect runs only once, after the initial render (with cleanup running only on unmount)",
      "The effect never runs",
      "It's a syntax error",
    ],
    correct_index: 1,
    explanation:
      "An empty dependency array tells React that the effect doesn't depend on any reactive values, so it only needs to run once after the initial render, with its cleanup (if any) running when the component unmounts. Omitting the array entirely, by contrast, makes the effect run after every render.",
    source_title: "React docs — useEffect",
    source_url: "https://react.dev/reference/react/useEffect",
    difficulty: "medium",
  },
  {
    topic: REACT_HOOKS,
    question: "Why does React recommend against omitting dependencies that are actually used inside a useEffect callback?",
    options: [
      "It has no consequences",
      "It can cause the effect to close over stale values from a previous render, so it doesn't 'see' updated props/state",
      "It will cause a compile error",
      "It disables all future effects",
    ],
    correct_index: 1,
    explanation:
      "If a value used inside the effect isn't listed as a dependency, the effect's closure can capture an outdated ('stale') version of that value from the render in which the effect was defined, rather than picking up on subsequent updates. This class of bug is why the recommended pattern is to include every reactive value the effect reads.",
    source_title: "React docs — useEffect",
    source_url: "https://react.dev/reference/react/useEffect",
    difficulty: "hard",
  },
  {
    topic: REACT_HOOKS,
    question: "What problem does useMemo primarily solve?",
    options: [
      "It prevents a component from ever re-rendering",
      "It caches (memoizes) the result of an expensive calculation between renders, recomputing only when its dependencies change",
      "It replaces useState entirely",
      "It manages side effects like data fetching",
    ],
    correct_index: 1,
    explanation:
      "useMemo memoizes the return value of a computation, only recalculating it when one of the listed dependencies changes — avoiding expensive recalculation on every render when the inputs haven't actually changed. It's a performance optimization, not a correctness mechanism.",
    source_title: "React docs — useMemo",
    source_url: "https://react.dev/reference/react/useMemo",
    difficulty: "medium",
  },
  {
    topic: REACT_HOOKS,
    question: "What does React.memo do when wrapping a component?",
    options: [
      "It stores component state in local storage",
      "It skips re-rendering the component if its props haven't changed (shallow comparison)",
      "It converts a function component into a class component",
      "It disables all hooks in that component",
    ],
    correct_index: 1,
    explanation:
      "React.memo wraps a component so React can skip re-rendering it if its props are shallowly equal to the previous render's props, which can help avoid unnecessary render work in components that re-render often with unchanged props. It's specifically about skipping renders triggered by a parent re-rendering, not about internal state changes.",
    source_title: "React docs — memo",
    source_url: "https://react.dev/reference/react/memo",
    difficulty: "medium",
  },
  {
    topic: REACT_HOOKS,
    question: "In React's rendering model, what is the distinction between the 'render' and 'commit' phases?",
    options: [
      "They are the same thing",
      "'Render' is where React calls your components to figure out what should be on screen (pure, no DOM changes yet); 'commit' is where React applies changes to the DOM",
      "'Commit' happens before 'render'",
      "'Render' only applies to class components",
    ],
    correct_index: 1,
    explanation:
      "During the render phase, React calls component functions to determine what the UI should look like, without touching the actual DOM — this phase should be pure and free of side effects. In the commit phase, React applies the calculated changes to the real DOM (and runs effects shortly after).",
    source_title: "React docs — Render and Commit",
    source_url: "https://react.dev/learn/render-and-commit",
    difficulty: "hard",
  },

  // ---- React Native / Expo ----
  {
    topic: REACT_NATIVE,
    question: "In the classic React Native architecture, what is 'the bridge'?",
    options: [
      "A network proxy for API calls",
      "The asynchronous, serialized messaging layer connecting the JavaScript thread to the native (iOS/Android) side",
      "A CSS framework",
      "A database ORM",
    ],
    correct_index: 1,
    explanation:
      "In React Native's classic architecture, the bridge is the mechanism that serializes messages (as JSON) between the JavaScript thread and native modules/UI, since JS and native code run on separate threads without shared memory. This asynchronous, batched communication is what historically constrained certain kinds of performance-sensitive interactions.",
    source_title: "React Native docs — Architecture Overview",
    source_url: "https://reactnative.dev/docs/architecture-overview",
    difficulty: "easy",
  },
  {
    topic: REACT_NATIVE,
    question: "What is a key motivation behind React Native's newer architecture (JSI-based, replacing the classic bridge)?",
    options: [
      "To remove JavaScript from React Native entirely",
      "To allow more direct, synchronous communication between JS and native code (via JSI) instead of async serialized bridge messages, reducing overhead",
      "To make apps only work offline",
      "To eliminate the need for native modules",
    ],
    correct_index: 1,
    explanation:
      "The newer architecture introduces JSI (JavaScript Interface), which allows JavaScript to hold direct references to native C++ objects and call methods synchronously when needed, rather than always serializing messages asynchronously across the bridge. This reduces overhead for cases like frequent UI measurements or animations.",
    source_title: "React Native docs — Architecture Overview",
    source_url: "https://reactnative.dev/docs/architecture-overview",
    difficulty: "medium",
  },
  {
    topic: REACT_NATIVE,
    question: "What does an Expo OTA (over-the-air) update let you do?",
    options: [
      "Update your app's JavaScript bundle and assets without submitting a new build to the App Store/Play Store",
      "Change the app's native permissions instantly",
      "Install a new version of iOS/Android on the device",
      "Bypass app store review permanently for native code changes",
    ],
    correct_index: 0,
    explanation:
      "OTA updates (via EAS Update in the modern Expo toolchain) let you push updated JavaScript and asset bundles directly to users' installed apps without going through app store review — as long as the change doesn't require new native code. Changes to native modules or permissions still require a new native build and store submission.",
    source_title: "Expo docs — EAS Update introduction",
    source_url: "https://docs.expo.dev/eas-update/introduction/",
    difficulty: "easy",
  },
  {
    topic: REACT_NATIVE,
    question: "Why can't an Expo/React Native OTA update be used to ship a change that adds a new native module or native permission?",
    options: [
      "OTA updates can do this fine",
      "OTA updates only replace the JS bundle and assets — native code changes require recompiling the native binary and a new store submission",
      "Native permissions are decided by the OS automatically, always",
      "There is no such limitation",
    ],
    correct_index: 1,
    explanation:
      "OTA updates only replace the JavaScript bundle and static assets bundled with the app; they can't modify the compiled native binary itself. Anything requiring new native code, libraries, or permissions declared in the native manifest needs a full native rebuild and a new app store release.",
    source_title: "Expo docs — EAS Update introduction",
    source_url: "https://docs.expo.dev/eas-update/introduction/",
    difficulty: "medium",
  },
  {
    topic: REACT_NATIVE,
    question: "What is Expo, in relation to React Native?",
    options: [
      "A completely separate mobile framework unrelated to React Native",
      "A framework and set of tools/services built around React Native that simplifies development, building, and deploying React Native apps",
      "A CSS-in-JS library",
      "A replacement for JavaScript",
    ],
    correct_index: 1,
    explanation:
      "Expo is a set of tools and services built on top of React Native that streamlines common tasks — providing a managed workflow, a large library of pre-built native modules, and cloud services (EAS Build, EAS Update) for building and deploying apps without needing to configure native Xcode/Android Studio projects directly.",
    source_title: "Expo docs — Introduction",
    source_url: "https://docs.expo.dev/",
    difficulty: "medium",
  },
  {
    topic: REACT_NATIVE,
    question:
      "In React Native, why can excessive bridge traffic (in the classic architecture) cause dropped frames during animations?",
    options: [
      "The bridge has no relationship to animation performance",
      "Each bridge crossing is asynchronous and serializes data as JSON, so frequent per-frame updates driven from JS can queue up and arrive too late for the native UI thread's 60fps budget",
      "Animations always run on the JS thread with no bridge involvement",
      "The bridge only affects network requests",
    ],
    correct_index: 1,
    explanation:
      "Because each classic-bridge crossing involves asynchronous, serialized (JSON) message passing, driving continuous per-frame updates from JavaScript (like animated values) can introduce enough latency that native rendering misses its 60fps frame budget, causing visible jank. This is a major reason libraries like Reanimated moved animation logic onto the native/UI thread rather than round-tripping through the bridge every frame.",
    source_title: "React Native docs — Architecture Overview",
    source_url: "https://reactnative.dev/docs/architecture-overview",
    difficulty: "hard",
  },

  // ---- Redis Caching Patterns ----
  {
    topic: REDIS,
    question: "What is the 'cache-aside' (lazy loading) pattern with Redis?",
    options: [
      "The app always writes to Redis first, then to the database",
      "The app checks Redis first; on a miss, it reads from the database and populates Redis before returning the result",
      "Redis automatically syncs with the database with no application code",
      "Redis replaces the database entirely",
    ],
    correct_index: 1,
    explanation:
      "In the cache-aside pattern, application code checks Redis first for requested data; on a cache miss, it queries the primary database, then stores the result in Redis before returning it to the caller, so subsequent requests hit the cache. This is one of the most common caching patterns because it only caches data that's actually requested.",
    source_title: "Redis docs — Caching",
    source_url: "https://redis.io/docs/latest/develop/use/",
    difficulty: "easy",
  },
  {
    topic: REDIS,
    question: "What does setting a TTL (time-to-live) on a Redis key accomplish?",
    options: [
      "It limits how many times the key can be read",
      "It causes Redis to automatically expire and remove the key after the specified duration",
      "It permanently locks the key from being modified",
      "It compresses the value",
    ],
    correct_index: 1,
    explanation:
      "A TTL, set via commands like EXPIRE or SETEX, tells Redis to automatically delete the key once the specified time has elapsed. This is central to cache invalidation strategies, ensuring stale cached data doesn't live forever without explicit intervention.",
    source_title: "Redis docs — EXPIRE",
    source_url: "https://redis.io/docs/latest/commands/expire/",
    difficulty: "medium",
  },
  {
    topic: REDIS,
    question: "What is a risk of the 'write-through' caching pattern compared to cache-aside?",
    options: [
      "It never keeps the cache consistent",
      "Every write incurs the latency of writing to both the cache and the database synchronously, even for data that may never be read again",
      "It doesn't require a database at all",
      "It can't be used with Redis",
    ],
    correct_index: 1,
    explanation:
      "In write-through caching, every write operation updates both the cache and the underlying database synchronously, which keeps them consistent but adds latency to every write — even for data that might never actually be read from the cache. Cache-aside, by contrast, only populates the cache on read misses, potentially caching less unnecessary data.",
    source_title: "Redis docs — Caching",
    source_url: "https://redis.io/docs/latest/develop/use/",
    difficulty: "medium",
  },
  {
    topic: REDIS,
    question: "Which Redis data structure would be most natural for implementing a leaderboard ranked by score?",
    options: ["String", "Sorted Set (ZSET)", "List", "Hash"],
    correct_index: 1,
    explanation:
      "A Sorted Set (ZSET) associates each member with a floating-point score and keeps members ordered by that score, with efficient operations for rank queries, range-by-score, and increments — making it the natural fit for leaderboards, rate limiters, and priority queues.",
    source_title: "Redis docs — Sorted sets",
    source_url: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
    difficulty: "medium",
  },
  {
    topic: REDIS,
    question: "What is the 'cache stampede'/'dogpile' effect in a Redis-backed system, and what's one mitigation?",
    options: [
      "Redis running out of disk space",
      "Many concurrent requests missing a just-expired hot key simultaneously and all hitting the database at once; mitigated with a short lock around regeneration or staggered/jittered TTLs",
      "A Redis replication bug",
      "Too many keys with no TTL set",
    ],
    correct_index: 1,
    explanation:
      "When a frequently-requested ('hot') key expires, many concurrent requests can miss the cache at the same instant and all query the database simultaneously to regenerate it, spiking load. Common mitigations include using a short-lived lock so only one request regenerates the value while others wait, or adding random jitter to TTLs so hot keys don't all expire at exactly the same moment.",
    source_title: "Redis docs — Caching",
    source_url: "https://redis.io/docs/latest/develop/use/",
    difficulty: "hard",
  },

  // ---- System Design Fundamentals ----
  {
    topic: SYSTEM_DESIGN,
    question: "What is the difference between horizontal and vertical scaling?",
    options: [
      "They are the same thing",
      "Horizontal scaling adds more machines/instances to share load; vertical scaling adds more resources (CPU/RAM) to a single existing machine",
      "Horizontal scaling only applies to databases",
      "Vertical scaling means adding more servers",
    ],
    correct_index: 1,
    explanation:
      "Horizontal scaling ('scaling out') increases capacity by adding more machines or instances that share the workload, while vertical scaling ('scaling up') increases the resources — CPU, memory, disk — of a single existing machine. Horizontal scaling generally offers better fault tolerance and no hard ceiling, but requires the application to support distributing work across nodes.",
    source_title: "AWS docs — AWS Well-Architected Framework",
    source_url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
    difficulty: "easy",
  },
  {
    topic: SYSTEM_DESIGN,
    question: "What is the primary role of a load balancer in a horizontally-scaled system?",
    options: [
      "To compress data before storage",
      "To distribute incoming client requests across multiple backend servers, improving availability and preventing any single server from being overwhelmed",
      "To encrypt data at rest",
      "To replace the need for a database",
    ],
    correct_index: 1,
    explanation:
      "A load balancer sits in front of a pool of backend servers and distributes incoming traffic across them according to a chosen algorithm (round robin, least connections, etc.), which both spreads load evenly and allows the system to keep serving traffic if one backend instance fails.",
    source_title: "AWS docs — What is Elastic Load Balancing?",
    source_url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
    difficulty: "medium",
  },
  {
    topic: SYSTEM_DESIGN,
    question:
      "Why does horizontally scaling a stateful application (one storing session data in server memory) cause problems without additional changes?",
    options: [
      "It doesn't cause any problems",
      "A user's session data may only exist on the specific server instance that first handled it, so requests routed to a different instance won't find it — requiring shared/external session storage or sticky sessions",
      "Horizontal scaling automatically synchronizes memory across all servers",
      "Stateful apps can't run on more than one server ever",
    ],
    correct_index: 1,
    explanation:
      "If session state is kept in a single server's local memory, a load-balanced request routed to a different server instance won't have access to that session, effectively logging the user out or losing their data. Common fixes are storing session state in a shared store like Redis, or using 'sticky sessions' that route a given client consistently to the same backend instance.",
    source_title: "AWS docs — AWS Well-Architected Framework",
    source_url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
    difficulty: "hard",
  },
  {
    topic: SYSTEM_DESIGN,
    question: "What does a 'health check' do in a load-balanced system?",
    options: [
      "It measures the CPU temperature of the load balancer itself",
      "It periodically probes each backend instance to verify it's responsive, so unhealthy instances can be automatically removed from rotation",
      "It checks the user's internet connection speed",
      "It's only relevant to database systems",
    ],
    correct_index: 1,
    explanation:
      "A load balancer's health check periodically sends requests (e.g. to a /health endpoint) to each backend instance to confirm it's responding correctly; instances that fail health checks are temporarily taken out of rotation so traffic isn't routed to a broken or overloaded server.",
    source_title: "AWS docs — What is Elastic Load Balancing?",
    source_url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
    difficulty: "medium",
  },
  {
    topic: SYSTEM_DESIGN,
    question: "In system design, what is the core tradeoff described by the CAP theorem for a distributed data store?",
    options: [
      "Cost, Availability, Performance — pick two",
      "During a network partition, a distributed system must choose between Consistency (all nodes see the same data) and Availability (every request gets a response), since Partition tolerance is generally required",
      "CAP stands for Caching, API, Protocol",
      "It only applies to single-server systems",
    ],
    correct_index: 1,
    explanation:
      "The CAP theorem states that a distributed data store can't simultaneously guarantee Consistency, Availability, and Partition tolerance — in practice, since network partitions must be tolerated in any real distributed system, the meaningful tradeoff is between Consistency and Availability when a partition occurs. Different databases make different choices here (e.g. many NoSQL stores favor availability, traditional relational replicas often favor consistency).",
    source_title: "AWS docs — AWS Well-Architected Framework",
    source_url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
    difficulty: "hard",
  },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  console.log(`Prepared ${questions.length} quiz questions across ${new Set(questions.map((q) => q.topic)).size} topics.`);

  const supabase = getSupabaseServerClient();
  const batches = chunk(questions, 20);

  let inserted = 0;
  for (const [index, batch] of batches.entries()) {
    const { data, error } = await supabase.from("quiz_questions").insert(batch).select("id");
    if (error) {
      console.error(`Batch ${index + 1}/${batches.length} failed:`, error.message);
      process.exit(1);
    }
    inserted += data?.length ?? 0;
    console.log(`Batch ${index + 1}/${batches.length}: inserted ${data?.length ?? 0} rows`);
  }

  console.log(`Done. Inserted ${inserted} of ${questions.length} questions.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
