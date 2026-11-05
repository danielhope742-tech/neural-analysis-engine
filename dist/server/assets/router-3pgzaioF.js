import "react";
import { HeadContent, Link, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
// src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
// src/components/ui/button.tsx
var buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9",
			"icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-8",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		"data-slot": "button",
		"data-variant": variant,
		"data-size": size,
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
// src/components/error-pages.tsx
function NotFoundPage() {
	return /* @__PURE__ */ jsx("main", {
		className: "grid min-h-svh place-items-center px-6 py-16",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md space-y-6 text-center",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-muted-foreground",
					children: "This page doesn’t exist. Check the address or return to the home page."
				}),
				/* @__PURE__ */ jsx(Button, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						children: "Go home"
					})
				})
			]
		})
	});
}
function RouteErrorPage({ reset }) {
	const router = useRouter();
	return /* @__PURE__ */ jsx("main", {
		className: "grid min-h-svh place-items-center px-6 py-16",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md space-y-6 text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "This page couldn’t load"
				}),
				/* @__PURE__ */ jsx("p", {
					role: "alert",
					className: "text-muted-foreground",
					children: "Please try again, or return to the home page."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ jsx("a", {
							href: "/",
							children: "Go home"
						})
					})]
				})
			]
		})
	});
}
// src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		theme: "light",
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
			info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
			warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
			error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
			loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		...props
	});
};
// src/components/ui/tooltip.tsx
function TooltipProvider({ delayDuration = 0, ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration,
		...props
	});
}
// src/routes/__root.tsx
var siteName = "Neural Digit Analysis Engine v2.4.0";
var siteDescription = "Live multi-market digit analysis for Volatility Indices: real-time tick streams, neural pattern recognition, confidence scoring, and walk-forward accuracy tracking.";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: siteName },
			{
				name: "description",
				content: siteDescription
			},
			{
				property: "og:title",
				content: siteName
			},
			{
				property: "og:description",
				content: siteDescription
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
			}
		]
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [
			/* @__PURE__ */ jsx(TooltipProvider, { children }),
			/* @__PURE__ */ jsx(Toaster$1, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
// src/routes/index.tsx
var $$splitComponentImporter = () => import("./routes-CdPbY4mv.js");
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
// src/lib/deriv/oauth-session.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function toBase64Url(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(value) {
	const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(base64);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
function randomToken(length = 32) {
	return toBase64Url(crypto.getRandomValues(new Uint8Array(length)));
}
async function createPkcePair() {
	const verifier = randomToken(48);
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
	return {
		verifier,
		challenge: toBase64Url(new Uint8Array(digest))
	};
}
async function encryptionKey(secret) {
	if (secret.length < 32) throw new Error("Session secret must be at least 32 characters.");
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
	return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
async function encryptSession(data, secret) {
	const key = await encryptionKey(secret);
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, encoder.encode(JSON.stringify(data)));
	return `${toBase64Url(iv)}.${toBase64Url(new Uint8Array(encrypted))}`;
}
async function decryptSession(value, secret) {
	try {
		const [ivPart, encryptedPart] = value.split(".");
		if (!ivPart || !encryptedPart) return null;
		const key = await encryptionKey(secret);
		const decrypted = await crypto.subtle.decrypt({
			name: "AES-GCM",
			iv: fromBase64Url(ivPart)
		}, key, fromBase64Url(encryptedPart));
		return JSON.parse(decoder.decode(decrypted));
	} catch {
		return null;
	}
}
function parseCookies(header) {
	const cookies = {};
	if (!header) return cookies;
	for (const part of header.split(";")) {
		const separator = part.indexOf("=");
		if (separator === -1) continue;
		const name = part.slice(0, separator).trim();
		const value = part.slice(separator + 1).trim();
		if (name) cookies[name] = decodeURIComponent(value);
	}
	return cookies;
}
function sessionCookie(value, maxAge = 3600) {
	return [
		`deriv_session=${encodeURIComponent(value)}`,
		"Path=/",
		"HttpOnly",
		"Secure",
		"SameSite=Lax",
		`Max-Age=${maxAge}`
	].join("; ");
}
// src/routes/auth.callback.tsx
var APP_ID = process.env.DERIV_APP_ID;
var SESSION_SECRET = process.env.DERIV_SESSION_SECRET;
var REDIRECT_URI$1 = "https://neural-analysis-engine.netlify.app/auth/callback";
var Route$2 = createFileRoute("/auth/callback")({ server: { handlers: { GET: async ({ request }) => {
	const clearPending = "deriv_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
	try {
		if (!APP_ID || !SESSION_SECRET) return new Response("Server configuration missing.", { status: 500 });
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		const returnedState = url.searchParams.get("state");
		if (url.searchParams.get("error")) return new Response("Deriv authorization was cancelled or denied. Please try again.", {
			status: 400,
			headers: { "Set-Cookie": clearPending }
		});
		if (!code || !returnedState) return new Response("Missing authorization code or state.", {
			status: 400,
			headers: { "Set-Cookie": clearPending }
		});
		const pendingValue = parseCookies(request.headers.get("cookie")).deriv_oauth;
		if (!pendingValue) return new Response("Login session expired. Please start again.", {
			status: 400,
			headers: { "Set-Cookie": clearPending }
		});
		const pending = await decryptSession(pendingValue, SESSION_SECRET);
		if (!pending || pending.state !== returnedState || !pending.verifier || Date.now() - pending.createdAt > 6e5) return new Response("Login verification failed. Please start again.", {
			status: 400,
			headers: { "Set-Cookie": clearPending }
		});
		const body = new URLSearchParams({
			grant_type: "authorization_code",
			client_id: APP_ID,
			code,
			code_verifier: pending.verifier,
			redirect_uri: REDIRECT_URI$1
		});
		const tokenResponse = await fetch("https://auth.deriv.com/oauth2/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body
		});
		const tokenData = await tokenResponse.json();
		if (!tokenResponse.ok || !tokenData.access_token || !tokenData.expires_in) return new Response("Deriv could not complete authorization. Please try again.", {
			status: 401,
			headers: { "Set-Cookie": clearPending }
		});
		const encryptedSession = await encryptSession({
			accessToken: tokenData.access_token,
			expiresAt: Date.now() + tokenData.expires_in * 1e3,
			tokenType: tokenData.token_type ?? "Bearer"
		}, SESSION_SECRET);
		const headers = new Headers();
		headers.set("Location", "/?deriv=connected");
		headers.set("Cache-Control", "no-store");
		headers.append("Set-Cookie", sessionCookie(encryptedSession, Math.min(tokenData.expires_in, 2592e3)));
		headers.append("Set-Cookie", clearPending);
		return new Response(null, {
			status: 303,
			headers
		});
	} catch {
		return new Response("An error occurred while connecting Deriv. Please try again.", {
			status: 500,
			headers: { "Set-Cookie": clearPending }
		});
	}
} } } });
// src/routes/api.deriv.account.ts
var Route$1 = createFileRoute("/api/deriv/account")({ server: { handlers: { GET: async ({ request }) => {
	try {
		const secret = process.env.DERIV_SESSION_SECRET;
		if (!secret) return Response.json({ error: "Server configuration missing." }, { status: 500 });
		const encrypted = parseCookies(request.headers.get("cookie")).deriv_session;
		if (!encrypted) return Response.json({ error: "Not connected. Please connect Deriv first." }, { status: 401 });
		const session = await decryptSession(encrypted, secret);
		if (!session || !session.accessToken || session.expiresAt <= Date.now()) return Response.json({ error: "Session expired. Please connect again." }, { status: 401 });
		const response = await fetch("https://api.derivws.com/trading/v1/options/accounts", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
				Accept: "application/json"
			},
			cache: "no-store"
		});
		const result = await response.json();
		if (!response.ok) return Response.json({ error: response.status === 401 ? "Deriv authorization expired. Please reconnect." : "Unable to retrieve Deriv account details." }, { status: response.status });
		return Response.json(result, { headers: { "Cache-Control": "no-store" } });
	} catch {
		return Response.json({ error: "Could not retrieve account information." }, { status: 500 });
	}
} } } });
// src/routes/api.deriv.auth.ts
var REDIRECT_URI = "https://neural-analysis-engine.netlify.app/auth/callback";
var Route = createFileRoute("/api/deriv/auth")({ server: { handlers: { GET: async () => {
	try {
		const appId = process.env.DERIV_APP_ID;
		const secret = process.env.DERIV_SESSION_SECRET;
		if (!appId || !secret) return new Response("Server configuration is incomplete. Set DERIV_APP_ID and DERIV_SESSION_SECRET in Netlify.", { status: 500 });
		const { verifier, challenge } = await createPkcePair();
		const state = randomToken(32);
		const pendingSession = await encryptSession({
			state,
			verifier,
			createdAt: Date.now()
		}, secret);
		const authUrl = new URL("https://auth.deriv.com/oauth2/auth");
		authUrl.searchParams.set("response_type", "code");
		authUrl.searchParams.set("client_id", appId);
		authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
		authUrl.searchParams.set("scope", "trade");
		authUrl.searchParams.set("state", state);
		authUrl.searchParams.set("code_challenge", challenge);
		authUrl.searchParams.set("code_challenge_method", "S256");
		return new Response(null, {
			status: 302,
			headers: {
				Location: authUrl.toString(),
				"Set-Cookie": [
					`deriv_oauth=${encodeURIComponent(pendingSession)}`,
					"Path=/",
					"HttpOnly",
					"Secure",
					"SameSite=Lax",
					"Max-Age=600"
				].join("; "),
				"Cache-Control": "no-store"
			}
		});
	} catch {
		return new Response("Could not start Deriv authorization. Please try again.", { status: 500 });
	}
} } } });
// src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	AuthCallbackRoute: Route$2.update({
		id: "/auth/callback",
		path: "/auth/callback",
		getParentRoute: () => Route$4
	}),
	ApiDerivAccountRoute: Route$1.update({
		id: "/api/deriv/account",
		path: "/api/deriv/account",
		getParentRoute: () => Route$4
	}),
	ApiDerivAuthRoute: Route.update({
		id: "/api/deriv/auth",
		path: "/api/deriv/auth",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
// src/router.tsx
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	return createRouter({
		routeTree,
		defaultErrorComponent: RouteErrorPage,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
export { getRouter, cn as n, router_exports as t };
