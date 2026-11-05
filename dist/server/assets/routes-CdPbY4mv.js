import { n as cn } from "./router-3pgzaioF.js";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, BrainCircuit, Cpu, Crosshair, Gauge, History, LineChart, Radar, Radio, RotateCw, ScanLine, Sparkles, Target, Timer } from "lucide-react";
// src/components/deriv-account.tsx
function getId(account, index) {
	return String(account.account_id ?? account.loginid ?? index);
}
function getMode(account) {
	const type = String(account.account_type ?? "").toLowerCase();
	const login = String(account.loginid ?? "").toLowerCase();
	if (type.includes("demo") || login.startsWith("vrtc")) return "demo";
	if (type.includes("real") || login.startsWith("cr")) return "real";
	return null;
}
function DerivAccount() {
	const [accounts, setAccounts] = useState([]);
	const [selectedId, setSelectedId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [connected, setConnected] = useState(false);
	const loadAccounts = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const response = await fetch("/api/deriv/account", {
				credentials: "same-origin",
				cache: "no-store"
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || "Unable to load accounts.");
			const list = Array.isArray(result) ? result : result.accounts ?? result.data?.accounts ?? result.data ?? [];
			if (!Array.isArray(list)) throw new Error("Unexpected account response format.");
			const next = list;
			setAccounts(next);
			setConnected(true);
			setSelectedId((current) => {
				if (current && next.some((a, i) => getId(a, i) === current)) return current;
				const saved = localStorage.getItem("ticklens-selected-account");
				if (saved && next.some((a, i) => getId(a, i) === saved)) return saved;
				const demoIndex = next.findIndex((a) => getMode(a) === "demo");
				return demoIndex >= 0 ? getId(next[demoIndex], demoIndex) : "";
			});
		} catch (err) {
			setConnected(false);
			setAccounts([]);
			setSelectedId("");
			setError(err instanceof Error ? err.message : "Connection failed.");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		if (window.location.search.includes("deriv=connected")) window.history.replaceState({}, "", window.location.pathname);
		loadAccounts();
	}, [loadAccounts]);
	function selectAccount(account, index) {
		const id = getId(account, index);
		setSelectedId(id);
		localStorage.setItem("ticklens-selected-account", id);
	}
	const selected = accounts.find((a, i) => getId(a, i) === selectedId);
	const selectedMode = selected ? getMode(selected) : null;
	const demoAccount = accounts.find((a) => getMode(a) === "demo");
	const realAccount = accounts.find((a) => getMode(a) === "real");
	return /* @__PURE__ */ jsxs("section", {
		className: "mb-6 rounded-xl border border-primary/30 bg-card p-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-lg font-bold",
					children: "Deriv Account"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Choose account mode"
				})] }), /* @__PURE__ */ jsx("span", {
					className: "rounded-full border px-3 py-1 text-xs",
					children: connected ? "Connected" : "Not connected"
				})]
			}),
			!connected ? /* @__PURE__ */ jsx("a", {
				href: "/api/deriv/auth",
				className: "mt-4 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground",
				children: "Connect Deriv"
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => void loadAccounts(),
					disabled: loading,
					className: "mt-4 rounded-lg border px-4 py-2 text-sm",
					children: loading ? "Refreshing..." : "Refresh accounts"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						disabled: !demoAccount,
						onClick: () => {
							const index = accounts.indexOf(demoAccount);
							selectAccount(demoAccount, index);
						},
						className: `rounded-xl border p-4 font-bold ${selectedMode === "demo" ? "border-green-500 bg-green-500/10 text-green-600" : "border-border"} disabled:opacity-40`,
						children: selectedMode === "demo" ? "✓ Demo Selected" : "Select Demo"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						disabled: !realAccount,
						onClick: () => {
							const index = accounts.indexOf(realAccount);
							selectAccount(realAccount, index);
						},
						className: `rounded-xl border p-4 font-bold ${selectedMode === "real" ? "border-primary bg-primary/10 text-primary" : "border-border"} disabled:opacity-40`,
						children: selectedMode === "real" ? "✓ Real Selected" : "Select Real"
					})]
				}),
				selected && /* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-sm font-semibold",
					children: ["Active website selection: ", selectedMode?.toUpperCase()]
				}),
				accounts.map((account, index) => /* @__PURE__ */ jsxs("div", {
					className: "mt-4 rounded-lg border p-3",
					children: [
						/* @__PURE__ */ jsxs("p", {
							className: "font-semibold",
							children: [
								getMode(account)?.toUpperCase() ?? "ACCOUNT",
								" — ",
								String(account.loginid ?? account.account_id ?? index + 1)
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-muted-foreground",
							children: ["Currency: ", String(account.currency ?? "Not provided")]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 font-bold",
							children: [
								"Balance: ",
								String(account.balance ?? "Not provided"),
								" ",
								String(account.currency ?? "")
							]
						})
					]
				}, getId(account, index)))
			] }),
			error && /* @__PURE__ */ jsx("p", {
				className: "mt-3 text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-4 text-xs text-muted-foreground",
				children: "Selection controls the website display only. It does not place trades or change the public live market feed."
			})
		]
	});
}
// src/lib/deriv/markets.ts
var MARKETS = [
	{
		symbol: "R_10",
		name: "Volatility 10 Index",
		short: "V10",
		pip: 3,
		interval: 2
	},
	{
		symbol: "R_25",
		name: "Volatility 25 Index",
		short: "V25",
		pip: 3,
		interval: 2
	},
	{
		symbol: "R_50",
		name: "Volatility 50 Index",
		short: "V50",
		pip: 4,
		interval: 2
	},
	{
		symbol: "R_75",
		name: "Volatility 75 Index",
		short: "V75",
		pip: 4,
		interval: 2
	},
	{
		symbol: "R_100",
		name: "Volatility 100 Index",
		short: "V100",
		pip: 2,
		interval: 2
	},
	{
		symbol: "1HZ10V",
		name: "Volatility 10 (1s) Index",
		short: "V10·1s",
		pip: 2,
		interval: 1
	},
	{
		symbol: "1HZ25V",
		name: "Volatility 25 (1s) Index",
		short: "V25·1s",
		pip: 2,
		interval: 1
	},
	{
		symbol: "1HZ50V",
		name: "Volatility 50 (1s) Index",
		short: "V50·1s",
		pip: 2,
		interval: 1
	},
	{
		symbol: "1HZ75V",
		name: "Volatility 75 (1s) Index",
		short: "V75·1s",
		pip: 2,
		interval: 1
	},
	{
		symbol: "1HZ100V",
		name: "Volatility 100 (1s) Index",
		short: "V100·1s",
		pip: 2,
		interval: 1
	}
];
var MARKET_BY_SYMBOL = Object.fromEntries(MARKETS.map((m) => [m.symbol, m]));
/** Public, unauthenticated market-data WebSocket endpoints, tried in order. */
var FEED_ENDPOINTS = ["wss://api.derivws.com/trading/v1/options/ws/public", "wss://ws.derivws.com/websockets/v3?app_id=1089"];
var HISTORY_COUNT = 1e3;
// src/lib/engine/model.ts
/**
* Online softmax-regression "neural digit" model.
*
* A single-layer network that learns P(next digit | recent digit context)
* with one SGD step per tick. Features: one-hot of the last three digits,
* parity of the last five digits, and a bias term.
*/
var LAGS = 3;
var PARITY_LAGS = 5;
var DigitNet = class {
	w;
	lr;
	l2;
	steps = 0;
	constructor(lr = .03, l2 = 1e-4) {
		this.w = /* @__PURE__ */ new Float64Array(360);
		this.lr = lr;
		this.l2 = l2;
	}
	/** Active feature indices + values for a context (most recent digit last). */
	features(ctx) {
		const n = ctx.length;
		const f = [];
		for (let lag = 0; lag < LAGS; lag++) f.push([lag * 10 + ctx[n - 1 - lag], 1]);
		for (let lag = 0; lag < PARITY_LAGS; lag++) f.push([30 + lag, ctx[n - 1 - lag] % 2 === 0 ? 1 : -1]);
		f.push([35, 1]);
		return f;
	}
	predict(ctx) {
		if (ctx.length < 5) return new Array(10).fill(.1);
		const f = this.features(ctx);
		const logits = new Array(10);
		let max = -Infinity;
		for (let k = 0; k < 10; k++) {
			let s = 0;
			for (const [i, v] of f) s += this.w[k * 36 + i] * v;
			logits[k] = s;
			if (s > max) max = s;
		}
		let sum = 0;
		for (let k = 0; k < 10; k++) {
			logits[k] = Math.exp(logits[k] - max);
			sum += logits[k];
		}
		return logits.map((v) => v / sum);
	}
	/** One SGD step on cross-entropy loss. Returns the pre-update prediction. */
	learn(ctx, target) {
		const probs = this.predict(ctx);
		if (ctx.length < 5) return probs;
		const f = this.features(ctx);
		for (let k = 0; k < 10; k++) {
			const grad = probs[k] - (k === target ? 1 : 0);
			for (const [i, v] of f) {
				const idx = k * 36 + i;
				this.w[idx] -= this.lr * (grad * v + this.l2 * this.w[idx]);
			}
		}
		this.steps++;
		return probs;
	}
};
var OUTCOME_WINDOW = 500;
/** Expected hit-rate of each tracked prediction if digits were uniformly random. */
var BASELINES = {
	matches: .1,
	differs: .9,
	even_odd: .5,
	over_under: .5
};
/** Ring buffer of 0/1 outcomes. */
var Outcomes = class {
	buf = new Uint8Array(OUTCOME_WINDOW);
	idx = 0;
	size = 0;
	hits = 0;
	push(hit) {
		if (this.size === OUTCOME_WINDOW) this.hits -= this.buf[this.idx];
		else this.size++;
		this.buf[this.idx] = hit ? 1 : 0;
		this.hits += hit ? 1 : 0;
		this.idx = (this.idx + 1) % OUTCOME_WINDOW;
	}
};
function lastDigit(quote, pip) {
	const s = quote.toFixed(pip);
	return Number(s[s.length - 1]);
}
/**
* Holds the tick history, digit sequence, online model, and walk-forward
* accuracy tracking for one market. Lives outside React and is mutated in place.
*/
var SymbolEngine = class {
	symbol;
	pip;
	prices = [];
	epochs = [];
	digits = [];
	net = new DigitNet();
	outcomes = {
		matches: new Outcomes(),
		differs: new Outcomes(),
		even_odd: new Outcomes(),
		over_under: new Outcomes()
	};
	lastTickAt = 0;
	tickCount = 0;
	version = 0;
	constructor(symbol, pip) {
		this.symbol = symbol;
		this.pip = pip;
	}
	/** Load historical ticks, training the model walk-forward so accuracy stats start populated. */
	seed(prices, epochs, pip) {
		if (pip !== void 0) this.pip = pip;
		this.prices = [];
		this.epochs = [];
		this.digits = [];
		this.net = new DigitNet();
		for (const k of Object.keys(this.outcomes)) this.outcomes[k] = new Outcomes();
		for (let i = 0; i < prices.length; i++) this.ingest(prices[i], epochs[i]);
		this.version++;
	}
	push(quote, epoch, pip) {
		if (pip !== void 0) this.pip = pip;
		if (this.epochs.length && epoch <= this.epochs[this.epochs.length - 1]) return;
		this.ingest(quote, epoch);
		this.lastTickAt = Date.now();
		this.tickCount++;
		this.version++;
	}
	ingest(quote, epoch) {
		const digit = lastDigit(quote, this.pip);
		const ctx = this.digits.length > 16 ? this.digits.slice(-16) : this.digits;
		if (ctx.length >= 5) {
			const p = this.net.learn(ctx, digit);
			let top = 0;
			let bottom = 0;
			for (let d = 1; d < 10; d++) {
				if (p[d] > p[top]) top = d;
				if (p[d] < p[bottom]) bottom = d;
			}
			const pEven = p[0] + p[2] + p[4] + p[6] + p[8];
			const pOver4 = p[5] + p[6] + p[7] + p[8] + p[9];
			this.outcomes.matches.push(digit === top);
			this.outcomes.differs.push(digit !== bottom);
			this.outcomes.even_odd.push(digit % 2 === 0 === pEven >= .5);
			this.outcomes.over_under.push(digit > 4 === pOver4 >= .5);
		}
		this.prices.push(quote);
		this.epochs.push(epoch);
		this.digits.push(digit);
		if (this.prices.length > 5e3) {
			this.prices.shift();
			this.epochs.shift();
			this.digits.shift();
		}
	}
	nextDigitProbs() {
		return this.net.predict(this.digits.slice(-16));
	}
};
// src/lib/deriv/client.ts
/**
* Multiplexes tick subscriptions for many markets over one WebSocket.
* Seeds each market with recent tick history, then streams live ticks into
* its SymbolEngine. Falls back through FEED_ENDPOINTS, and finally to a
* clearly-labelled simulated feed if no endpoint is reachable.
*/
var MarketFeed = class {
	engines = /* @__PURE__ */ new Map();
	snapshot = {
		status: "connecting",
		endpoint: null,
		rttMs: null,
		feedLagMs: null,
		ticksPerMin: 0,
		error: null
	};
	ws = null;
	endpointIdx = 0;
	failures = 0;
	reqId = 1;
	pingSent = /* @__PURE__ */ new Map();
	timers = [];
	simTimer = null;
	recentTicks = [];
	closed = false;
	constructor(symbols) {
		for (const s of symbols) this.engines.set(s, new SymbolEngine(s, MARKET_BY_SYMBOL[s]?.pip ?? 2));
	}
	start() {
		this.connect();
		this.timers.push(window.setInterval(() => this.ping(), 5e3));
	}
	stop() {
		this.closed = true;
		this.timers.forEach((t) => clearInterval(t));
		if (this.simTimer) clearInterval(this.simTimer);
		this.ws?.close();
	}
	send(payload) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			const req_id = this.reqId++;
			this.ws.send(JSON.stringify({
				...payload,
				req_id
			}));
			return req_id;
		}
		return null;
	}
	connect() {
		if (this.closed) return;
		const url = FEED_ENDPOINTS[this.endpointIdx];
		let opened = false;
		let ws;
		try {
			ws = new WebSocket(url);
		} catch {
			this.onFail();
			return;
		}
		this.ws = ws;
		ws.onopen = () => {
			opened = true;
			this.failures = 0;
			if (this.simTimer) this.stopSimulation();
			this.snapshot = {
				...this.snapshot,
				status: "live",
				endpoint: url,
				error: null
			};
			for (const symbol of this.engines.keys()) this.subscribeHistory(symbol);
			this.ping();
		};
		ws.onmessage = (ev) => {
			try {
				this.handle(JSON.parse(ev.data));
			} catch {}
		};
		ws.onclose = () => {
			if (this.closed || this.ws !== ws) return;
			if (!opened) this.endpointIdx++;
			this.onFail();
		};
	}
	onFail() {
		this.failures++;
		if (this.endpointIdx >= FEED_ENDPOINTS.length) {
			this.endpointIdx = 0;
			if (this.failures >= FEED_ENDPOINTS.length && this.snapshot.status !== "simulated") this.startSimulation();
		}
		if (this.snapshot.status !== "simulated") this.snapshot = {
			...this.snapshot,
			status: "reconnecting"
		};
		const delay = Math.min(15e3, 1e3 * 2 ** Math.min(this.failures, 4));
		window.setTimeout(() => this.connect(), delay);
	}
	subscribeHistory(symbol) {
		this.send({
			ticks_history: symbol,
			adjust_start_time: 1,
			count: HISTORY_COUNT,
			end: "latest",
			style: "ticks",
			subscribe: 1
		});
	}
	ping() {
		const id = this.send({ ping: 1 });
		if (id !== null) this.pingSent.set(id, performance.now());
	}
	handle(msg) {
		if (msg.error) {
			const sym = msg.echo_req?.ticks_history;
			if (sym && msg.error.code !== "AlreadySubscribed") this.send({
				ticks: sym,
				subscribe: 1
			});
			else if (!sym) this.snapshot = {
				...this.snapshot,
				error: msg.error.message ?? null
			};
			return;
		}
		if (msg.msg_type === "ping" && msg.req_id !== void 0) {
			const sent = this.pingSent.get(msg.req_id);
			if (sent !== void 0) {
				this.snapshot = {
					...this.snapshot,
					rttMs: Math.round(performance.now() - sent)
				};
				this.pingSent.delete(msg.req_id);
			}
			return;
		}
		if (msg.msg_type === "history") {
			const h = msg;
			const sym = h.echo_req.ticks_history;
			const engine = sym ? this.engines.get(sym) : void 0;
			if (!engine || !h.history?.prices || !h.history.times) return;
			if (this.snapshot.status === "simulated") this.stopSimulation();
			engine.seed(h.history.prices, h.history.times, h.pip_size);
			return;
		}
		if (msg.msg_type === "tick") {
			const t = msg.tick;
			if (!t?.symbol || t.quote === void 0 || t.epoch === void 0) return;
			const engine = this.engines.get(t.symbol);
			if (!engine) return;
			if (this.snapshot.status === "simulated") this.stopSimulation();
			engine.push(t.quote, t.epoch, t.pip_size);
			this.recordTick(t.epoch);
		}
	}
	recordTick(epoch) {
		const now = Date.now();
		this.recentTicks.push(now);
		while (this.recentTicks.length && now - this.recentTicks[0] > 6e4) this.recentTicks.shift();
		this.snapshot = {
			...this.snapshot,
			ticksPerMin: this.recentTicks.length,
			feedLagMs: Math.max(0, now - epoch * 1e3)
		};
	}
	startSimulation() {
		this.snapshot = {
			...this.snapshot,
			status: "simulated",
			endpoint: "local simulation",
			rttMs: 0
		};
		const now = Math.floor(Date.now() / 1e3);
		for (const engine of this.engines.values()) {
			const m = MARKET_BY_SYMBOL[engine.symbol];
			const prices = [];
			const times = [];
			let p = 1e3 + Math.random() * 9e3;
			for (let i = HISTORY_COUNT; i > 0; i--) {
				p *= 1 + gauss() * 4e-4;
				prices.push(Number(p.toFixed(m.pip)));
				times.push(now - i * m.interval);
			}
			engine.seed(prices, times, m.pip);
		}
		let tick = 0;
		this.simTimer = window.setInterval(() => {
			tick++;
			const epoch = Math.floor(Date.now() / 1e3);
			for (const engine of this.engines.values()) {
				const m = MARKET_BY_SYMBOL[engine.symbol];
				if (tick % m.interval !== 0) continue;
				const last = engine.prices[engine.prices.length - 1] ?? 1e3;
				engine.push(Number((last * (1 + gauss() * 4e-4)).toFixed(m.pip)), epoch, m.pip);
				this.recordTick(epoch);
			}
		}, 1e3);
	}
	stopSimulation() {
		if (this.simTimer) clearInterval(this.simTimer);
		this.simTimer = null;
		this.snapshot = {
			...this.snapshot,
			status: "live",
			endpoint: FEED_ENDPOINTS[this.endpointIdx]
		};
	}
};
function gauss() {
	const u = 1 - Math.random();
	const v = Math.random();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
// src/lib/deriv/use-market-feed.ts
var INITIAL = {
	status: "connecting",
	endpoint: null,
	rttMs: null,
	feedLagMs: null,
	ticksPerMin: 0,
	error: null
};
/**
* Starts one MarketFeed for every market on mount (client only) and re-renders
* at a fixed cadence so analysis stays smooth regardless of tick bursts.
*/
function useMarketFeed(refreshMs = 400) {
	const [feed, setFeed] = useState(null);
	const [frame, setFrame] = useState(0);
	const [snapshot, setSnapshot] = useState(INITIAL);
	useEffect(() => {
		const feed = new MarketFeed(MARKETS.map((m) => m.symbol));
		setFeed(feed);
		feed.start();
		let lastVersion = -1;
		const id = window.setInterval(() => {
			let v = 0;
			for (const e of feed.engines.values()) v += e.version;
			if (v !== lastVersion) {
				lastVersion = v;
				setFrame((f) => f + 1);
			}
			setSnapshot(feed.snapshot);
		}, refreshMs);
		return () => {
			clearInterval(id);
			feed.stop();
			setFeed(null);
		};
	}, [refreshMs]);
	return {
		feed,
		frame,
		snapshot
	};
}
// src/lib/engine/stats.ts
/** Statistical helpers used by the analysis engine. Pure functions, no dependencies. */
/** Standard normal CDF (Abramowitz & Stegun 7.1.26 via erf). */
function normalCdf(z) {
	const t = 1 / (1 + .3275911 * Math.abs(z) / Math.SQRT2);
	const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-(z * z) / 2);
	return z >= 0 ? .5 * (1 + y) : .5 * (1 - y);
}
function logGamma(x) {
	const c = [
		76.18009172947146,
		-86.50532032941678,
		24.01409824083091,
		-1.231739572450155,
		.001208650973866179,
		-5395239384953e-18
	];
	let y = x;
	const tmp = x + 5.5 - (x + .5) * Math.log(x + 5.5);
	let ser = 1.000000000190015;
	for (const ci of c) ser += ci / ++y;
	return -tmp + Math.log(2.5066282746310007 * ser / x);
}
/** Regularized upper incomplete gamma Q(a, x). */
function gammaQ(a, x) {
	if (x <= 0) return 1;
	if (x < a + 1) {
		let sum = 1 / a;
		let del = sum;
		let ap = a;
		for (let n = 0; n < 200; n++) {
			ap += 1;
			del *= x / ap;
			sum += del;
			if (Math.abs(del) < Math.abs(sum) * 1e-10) break;
		}
		return 1 - sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
	}
	let b = x + 1 - a;
	let c = 1 / 1e-300;
	let d = 1 / b;
	let h = d;
	for (let i = 1; i < 200; i++) {
		const an = -i * (i - a);
		b += 2;
		d = an * d + b;
		if (Math.abs(d) < 1e-300) d = 1e-300;
		c = b + an / c;
		if (Math.abs(c) < 1e-300) c = 1e-300;
		d = 1 / d;
		const del = d * c;
		h *= del;
		if (Math.abs(del - 1) < 1e-10) break;
	}
	return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}
/** p-value of a chi-square statistic with `df` degrees of freedom. */
function chiSquarePValue(stat, df) {
	return gammaQ(df / 2, stat / 2);
}
/** z-score of an observed proportion against an expected one. */
function proportionZ(observed, expected, n) {
	if (n === 0) return 0;
	const se = Math.sqrt(expected * (1 - expected) / n);
	return se === 0 ? 0 : (observed - expected) / se;
}
/** Wilson score interval for a binomial proportion. */
function wilson(successes, n, z = 1.96) {
	if (n === 0) return [0, 1];
	const p = successes / n;
	const denom = 1 + z * z / n;
	const centre = p + z * z / (2 * n);
	const margin = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
	return [(centre - margin) / denom, (centre + margin) / denom];
}
/** Shannon entropy of a distribution, normalised to [0, 1]. */
function normalisedEntropy(probs) {
	let h = 0;
	for (const p of probs) if (p > 0) h -= p * Math.log(p);
	return h / Math.log(probs.length);
}
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// src/lib/engine/analyzer.ts
function bandOf(confidence) {
	if (confidence >= 98) return "extreme";
	if (confidence >= 87) return "strong";
	if (confidence >= 70) return "weak";
	return "noise";
}
var blend = (freq, model, n) => {
	const w = clamp(n / 4e3, .1, .35);
	return freq * (1 - w) + model * w;
};
function makeSignal(family, label, observed, model, baseline, n) {
	const z = proportionZ(observed, baseline, n);
	const probability = blend(observed, model, n);
	const confidence = clamp(normalCdf(z) * 100, 0, 99.9);
	return {
		family,
		label,
		probability,
		baseline,
		edge: (probability - baseline) * 100,
		confidence,
		z,
		band: bandOf(confidence)
	};
}
function analyze(engine, windowSize) {
	const digits = engine.digits.slice(-windowSize);
	const n = digits.length;
	const counts = new Array(10).fill(0);
	for (const d of digits) counts[d]++;
	const freq = counts.map((c) => n ? c / n : .1);
	const digitZ = freq.map((f) => proportionZ(f, .1, n));
	const exp = n / 10;
	const chi2 = n ? counts.reduce((s, c) => s + (c - exp) ** 2 / exp, 0) : 0;
	const chi2P = n ? chiSquarePValue(chi2, 9) : 1;
	const evenRate = n ? (counts[0] + counts[2] + counts[4] + counts[6] + counts[8]) / n : .5;
	const overRates = [];
	for (let b = 0; b < 10; b++) {
		let s = 0;
		for (let d = b + 1; d < 10; d++) s += freq[d];
		overRates.push(s);
	}
	let streakLen = 0;
	const lastD = n ? digits[n - 1] : null;
	if (lastD !== null) {
		const parity = lastD % 2;
		for (let i = n - 1; i >= 0 && digits[i] % 2 === parity; i--) streakLen++;
	}
	let dStreak = 0;
	if (lastD !== null) for (let i = n - 1; i >= 0 && digits[i] === lastD; i--) dStreak++;
	const transitions = Array.from({ length: 10 }, () => new Array(10).fill(0));
	for (let i = 1; i < n; i++) transitions[digits[i - 1]][digits[i]]++;
	const transitionsNorm = transitions.map((row) => {
		const s = row.reduce((a, b) => a + b, 0);
		return row.map((v) => s ? v / s : .1);
	});
	const modelProbs = engine.nextDigitProbs();
	const mEven = modelProbs[0] + modelProbs[2] + modelProbs[4] + modelProbs[6] + modelProbs[8];
	const signals = [];
	signals.push(evenRate >= .5 ? makeSignal("even_odd", "EVEN", evenRate, mEven, .5, n) : makeSignal("even_odd", "ODD", 1 - evenRate, 1 - mEven, .5, n));
	let bestOU = null;
	for (let b = 0; b <= 8; b++) {
		const exp = (9 - b) / 10;
		let mOver = 0;
		for (let d = b + 1; d < 10; d++) mOver += modelProbs[d];
		const s = makeSignal("over_under", `OVER ${b}`, overRates[b], mOver, exp, n);
		if (!bestOU || s.z > bestOU.z) bestOU = s;
	}
	for (let b = 1; b <= 9; b++) {
		const exp = b / 10;
		const obs = 1 - overRates[b - 1];
		let mUnder = 0;
		for (let d = 0; d < b; d++) mUnder += modelProbs[d];
		const s = makeSignal("over_under", `UNDER ${b}`, obs, mUnder, exp, n);
		if (!bestOU || s.z > bestOU.z) bestOU = s;
	}
	if (bestOU) signals.push(bestOU);
	let hot = 0;
	let cold = 0;
	for (let d = 1; d < 10; d++) {
		if (digitZ[d] > digitZ[hot]) hot = d;
		if (digitZ[d] < digitZ[cold]) cold = d;
	}
	const matches = makeSignal("matches_differs", `MATCHES ${hot}`, freq[hot], modelProbs[hot], .1, n);
	const differs = makeSignal("matches_differs", `DIFFERS ${cold}`, 1 - freq[cold], 1 - modelProbs[cold], .9, n);
	signals.push(matches.z >= differs.z ? matches : differs);
	const best = signals.reduce((a, s) => !a || s.confidence > a.confidence ? s : a, null);
	const accuracy = Object.keys(BASELINES).map((k) => {
		const o = engine.outcomes[k];
		const rate = o.size ? o.hits / o.size : 0;
		return {
			contract: k,
			hits: o.hits,
			n: o.size,
			rate,
			baseline: BASELINES[k],
			advantage: (rate - BASELINES[k]) * 100,
			ci: wilson(o.hits, o.size)
		};
	});
	const prices = engine.prices.slice(-Math.min(windowSize, 300));
	let vol = 0;
	if (prices.length > 2) {
		const r = [];
		for (let i = 1; i < prices.length; i++) r.push(Math.log(prices[i] / prices[i - 1]));
		const m = r.reduce((a, b) => a + b, 0) / r.length;
		vol = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / r.length) * 1e4;
	}
	const lp = engine.prices;
	const change = lp.length > 1 ? lp[lp.length - 1] - lp[lp.length - 2] : 0;
	return {
		symbol: engine.symbol,
		n,
		counts,
		freq,
		digitZ,
		chi2,
		chi2P,
		skewScore: clamp((1 - chi2P) * 100, 0, 99.9),
		entropy: normalisedEntropy(freq),
		evenRate,
		overRates,
		streak: {
			kind: lastD !== null && lastD % 2 === 0 ? "even" : "odd",
			length: streakLen
		},
		digitStreak: {
			digit: lastD ?? 0,
			length: dStreak
		},
		modelProbs,
		transitions: transitionsNorm,
		signals,
		best,
		accuracy,
		volatility: vol,
		lastDigit: lastD,
		lastQuote: lp.length ? lp[lp.length - 1] : null,
		change
	};
}
/** Rolling digit frequency per segment, for the historical heatmap. */
function rollingHeatmap(digits, segments, segSize) {
	const out = [];
	const start = Math.max(0, digits.length - segments * segSize);
	for (let s = start; s + segSize <= digits.length; s += segSize) {
		const c = new Array(10).fill(0);
		for (let i = s; i < s + segSize; i++) c[digits[i]]++;
		out.push(c.map((v) => v / segSize));
	}
	return out;
}
/** Rolling even-rate series for the trend chart. */
function rollingRate(digits, win, pred, points = 120) {
	const out = [];
	if (digits.length < win) return out;
	const step = Math.max(1, Math.floor((digits.length - win) / points));
	for (let end = win; end <= digits.length; end += step) {
		let h = 0;
		for (let i = end - win; i < end; i++) if (pred(digits[i])) h++;
		out.push(h / win);
	}
	return out;
}
// src/components/ui/skeleton.tsx
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "skeleton",
		className: cn("animate-pulse motion-reduce:animate-none rounded-md bg-accent", className),
		...props
	});
}
// src/components/engine/status-bar.tsx
var STATUS = {
	connecting: {
		label: "Connecting",
		dot: "bg-chart-3"
	},
	live: {
		label: "Live feed",
		dot: "bg-up"
	},
	reconnecting: {
		label: "Reconnecting",
		dot: "bg-chart-3"
	},
	simulated: {
		label: "Simulated feed",
		dot: "bg-chart-4"
	}
};
function StatusBar({ snapshot, marketCount }) {
	const s = STATUS[snapshot.status];
	return /* @__PURE__ */ jsx("header", {
		className: "sticky top-0 z-30 border-b bg-background/85 backdrop-blur",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-content flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative grid size-9 place-items-center rounded-md border border-primary/40 bg-primary/10",
					children: [/* @__PURE__ */ jsx(Cpu, { className: "size-5 text-primary" }), /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 size-2.5 rounded-full bg-accent pulse-dot" })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "leading-tight",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "font-display text-lg font-semibold tracking-wide",
						children: "Neural Digit Analysis Engine"
					}), /* @__PURE__ */ jsxs("p", {
						className: "tabular text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
						children: [
							"v2.4.0 · ",
							marketCount,
							" volatility markets"
						]
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "ml-auto flex flex-wrap items-center gap-2 text-xs",
				children: [
					/* @__PURE__ */ jsxs(Pill, { children: [/* @__PURE__ */ jsx("span", { className: cn("size-2 rounded-full", s.dot, snapshot.status === "live" && "pulse-dot") }), /* @__PURE__ */ jsx("span", {
						className: "font-medium",
						children: s.label
					})] }),
					/* @__PURE__ */ jsxs(Pill, {
						title: "WebSocket round-trip latency (ping)",
						children: [
							/* @__PURE__ */ jsx(Timer, { className: "size-3.5 text-muted-foreground" }),
							/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: "RTT"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tabular",
								children: snapshot.rttMs !== null ? `${snapshot.rttMs} ms` : "—"
							})
						]
					}),
					/* @__PURE__ */ jsxs(Pill, {
						title: "Time between tick epoch and arrival (includes clock offset)",
						children: [
							/* @__PURE__ */ jsx(Radio, { className: "size-3.5 text-muted-foreground" }),
							/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: "Feed lag"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tabular",
								children: snapshot.feedLagMs !== null ? `${(snapshot.feedLagMs / 1e3).toFixed(2)} s` : "—"
							})
						]
					}),
					/* @__PURE__ */ jsxs(Pill, {
						title: "Ticks processed across all markets in the last minute",
						children: [
							/* @__PURE__ */ jsx(Activity, { className: "size-3.5 text-muted-foreground" }),
							/* @__PURE__ */ jsx("span", {
								className: "tabular",
								children: snapshot.ticksPerMin
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: "ticks/min"
							})
						]
					})
				]
			})]
		})
	});
}
function Pill({ children, title }) {
	return /* @__PURE__ */ jsx("div", {
		title,
		className: "flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5",
		children
	});
}
// src/components/engine/format.ts
var pct = (v, d = 1) => `${(v * 100).toFixed(d)}%`;
var signed = (v, d = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(d)}`;
var BAND_META = {
	noise: {
		label: "Noise",
		text: "text-muted-foreground",
		bg: "bg-muted",
		bar: "bg-muted-foreground/50"
	},
	weak: {
		label: "Developing",
		text: "text-chart-3",
		bg: "bg-chart-3/15",
		bar: "bg-chart-3"
	},
	strong: {
		label: "Strong edge",
		text: "text-primary",
		bg: "bg-primary/15",
		bar: "bg-primary"
	},
	extreme: {
		label: "Extreme skew",
		text: "text-accent",
		bg: "bg-accent/15",
		bar: "bg-accent"
	}
};
var FAMILY_LABEL = {
	matches_differs: "Matches / Differs",
	even_odd: "Even / Odd",
	over_under: "Over / Under"
};
var CONTRACT_LABEL = {
	matches: "Matches (top digit)",
	differs: "Differs (coldest digit)",
	even_odd: "Even / Odd",
	over_under: "Over 4 / Under 5"
};
/** Splits a quote so the last (analysed) digit can be highlighted. */
function splitQuote(q, pip) {
	if (q === null) return ["—", ""];
	const s = q.toFixed(pip);
	return [s.slice(0, -1), s.slice(-1)];
}
// src/components/engine/charts.tsx
function Sparkline({ values, className, stroke = "var(--primary)", fill = true }) {
	const id = useId();
	if (values.length < 2) return /* @__PURE__ */ jsx("div", { className: cn("h-8", className) });
	const min = Math.min(...values);
	const range = Math.max(...values) - min || 1;
	const d = values.map((v, i) => [i / (values.length - 1) * 100, 36 - (v - min) / range * 32 - 2]).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join("");
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 100 36",
		preserveAspectRatio: "none",
		className: cn("h-8 w-full", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id,
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: stroke,
					stopOpacity: "0.35"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: stroke,
					stopOpacity: "0"
				})]
			}) }),
			fill && /* @__PURE__ */ jsx("path", {
				d: `${d}L100,36L0,36Z`,
				fill: `url(#${id})`
			}),
			/* @__PURE__ */ jsx("path", {
				d,
				fill: "none",
				stroke,
				strokeWidth: "1.5",
				vectorEffect: "non-scaling-stroke"
			})
		]
	});
}
/** Price stream with gridlines, last-price marker and per-tick digit dots. */
function PriceStream({ prices, digits, pip }) {
	const id = useId();
	const W = 800;
	const H = 220;
	if (prices.length < 2) return /* @__PURE__ */ jsx("div", {
		className: "flex h-[220px] items-center justify-center text-sm text-muted-foreground",
		children: "Waiting for ticks…"
	});
	const min = Math.min(...prices);
	const range = Math.max(...prices) - min || 1;
	const x = (i) => i / (prices.length - 1) * 730;
	const y = (v) => 196 - (v - min) / range * 172;
	const d = prices.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
	const last = prices[prices.length - 1];
	const grid = [
		0,
		.25,
		.5,
		.75,
		1
	].map((t) => min + range * t);
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${W} ${H}`,
		className: "h-[220px] w-full",
		role: "img",
		"aria-label": "Live price stream",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id,
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "var(--primary)",
					stopOpacity: "0.28"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: "var(--primary)",
					stopOpacity: "0"
				})]
			}) }),
			grid.map((g) => /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
				x1: 0,
				x2: 730,
				y1: y(g),
				y2: y(g),
				stroke: "var(--border)",
				strokeDasharray: "2 4"
			}), /* @__PURE__ */ jsx("text", {
				x: 736,
				y: y(g) + 4,
				fontSize: "10",
				fill: "var(--muted-foreground)",
				fontFamily: "var(--font-data)",
				children: g.toFixed(pip)
			})] }, g)),
			/* @__PURE__ */ jsx("path", {
				d: `${d}L${x(prices.length - 1)},${H}L0,${H}Z`,
				fill: `url(#${id})`
			}),
			/* @__PURE__ */ jsx("path", {
				d,
				fill: "none",
				stroke: "var(--primary)",
				strokeWidth: "1.75",
				strokeLinejoin: "round"
			}),
			prices.map((v, i) => i >= prices.length - 30 ? /* @__PURE__ */ jsx("circle", {
				cx: x(i),
				cy: y(v),
				r: 2.2,
				fill: digits[i] % 2 === 0 ? "var(--chart-1)" : "var(--chart-4)"
			}, i) : null),
			/* @__PURE__ */ jsx("line", {
				x1: 0,
				x2: 730,
				y1: y(last),
				y2: y(last),
				stroke: "var(--accent)",
				strokeOpacity: "0.5"
			}),
			/* @__PURE__ */ jsx("rect", {
				x: 732,
				y: y(last) - 9,
				width: 66,
				height: 18,
				rx: 3,
				fill: "var(--accent)"
			}),
			/* @__PURE__ */ jsx("text", {
				x: 736,
				y: y(last) + 4,
				fontSize: "10.5",
				fontWeight: "700",
				fill: "var(--accent-foreground)",
				fontFamily: "var(--font-data)",
				children: last.toFixed(pip)
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: x(prices.length - 1),
				cy: y(last),
				r: 4,
				fill: "var(--accent)",
				className: "pulse-dot"
			})
		]
	});
}
/** Line chart for a rate series with a baseline reference. */
function RateLine({ series, baseline, color, label }) {
	const W = 400;
	const H = 120;
	if (series.length < 2) return /* @__PURE__ */ jsx("div", { className: "h-[120px]" });
	const lo = Math.min(baseline - .08, ...series);
	const hi = Math.max(baseline + .08, ...series);
	const y = (v) => 112 - (v - lo) / (hi - lo) * 104;
	const x = (i) => i / (series.length - 1) * W;
	const d = series.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: `0 0 ${W} ${H}`,
		className: "h-[120px] w-full",
		role: "img",
		"aria-label": label,
		children: [
			/* @__PURE__ */ jsx("line", {
				x1: 0,
				x2: W,
				y1: y(baseline),
				y2: y(baseline),
				stroke: "var(--muted-foreground)",
				strokeDasharray: "4 4",
				strokeOpacity: "0.6"
			}),
			/* @__PURE__ */ jsxs("text", {
				x: 4,
				y: y(baseline) - 4,
				fontSize: "10",
				fill: "var(--muted-foreground)",
				fontFamily: "var(--font-data)",
				children: [
					"baseline ",
					(baseline * 100).toFixed(0),
					"%"
				]
			}),
			/* @__PURE__ */ jsx("path", {
				d,
				fill: "none",
				stroke: color,
				strokeWidth: "2",
				strokeLinejoin: "round"
			})
		]
	});
}
// src/components/engine/market-scanner.tsx
function MarketScanner({ rows, selected, onSelect, filter, onFilter }) {
	const scored = rows.map((r) => {
		const sig = filter === "all" ? r.analysis.best : r.analysis.signals.find((s) => s.family === filter) ?? null;
		return {
			...r,
			sig
		};
	}).sort((a, b) => (b.sig?.confidence ?? 0) - (a.sig?.confidence ?? 0));
	return /* @__PURE__ */ jsxs("section", {
		className: "flex flex-col rounded-lg border bg-card/80",
		"aria-label": "Market scanner",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2 border-b px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(ScanLine, { className: "size-4 text-primary" }), /* @__PURE__ */ jsx("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-wider",
						children: "Market scanner"
					})]
				}), /* @__PURE__ */ jsx("span", {
					className: "tabular text-[11px] text-muted-foreground",
					children: "ranked by confidence"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex gap-1 overflow-x-auto border-b px-3 py-2",
				role: "tablist",
				children: [
					"all",
					"matches_differs",
					"even_odd",
					"over_under"
				].map((f) => /* @__PURE__ */ jsx("button", {
					role: "tab",
					"aria-selected": filter === f,
					onClick: () => onFilter(f),
					className: cn("whitespace-nowrap rounded px-2.5 py-1 text-xs transition-colors", filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"),
					children: f === "all" ? "Best signal" : FAMILY_LABEL[f]
				}, f))
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "divide-y",
				children: scored.map(({ analysis: a, pip, spark, sig }) => {
					const m = MARKET_BY_SYMBOL[a.symbol];
					const [head, tail] = splitQuote(a.lastQuote, pip);
					const band = sig ? BAND_META[sig.band] : BAND_META.noise;
					const active = a.symbol === selected;
					return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						onClick: () => onSelect(a.symbol),
						className: cn("grid w-full grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors", active ? "bg-primary/10 shadow-[inset_3px_0_0_var(--primary)]" : "hover:bg-muted/60"),
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-display text-sm font-semibold",
										children: m.short
									}), /* @__PURE__ */ jsx("span", {
										className: "truncate text-[11px] text-muted-foreground",
										children: m.symbol
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "tabular flex items-center gap-1 text-sm",
									children: [
										/* @__PURE__ */ jsx("span", { children: head }),
										/* @__PURE__ */ jsx("span", {
											className: "tick-flash rounded px-0.5 font-bold text-accent",
											children: tail
										}, `${a.symbol}-${a.n}-${a.lastQuote}`),
										a.change > 0 ? /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-3.5 text-up" }) : a.change < 0 ? /* @__PURE__ */ jsx(ArrowDownRight, { className: "size-3.5 text-down" }) : null
									]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "w-20 self-center",
								children: /* @__PURE__ */ jsx(Sparkline, {
									values: spark,
									stroke: a.change >= 0 ? "var(--up)" : "var(--down)"
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "col-span-2 flex items-center gap-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: cn("tabular rounded px-1.5 py-0.5 text-[11px] font-semibold", band.bg, band.text),
										children: sig?.label ?? "—"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
										children: /* @__PURE__ */ jsx("div", {
											className: cn("h-full rounded-full transition-all", band.bar),
											style: { width: `${sig?.confidence ?? 0}%` }
										})
									}),
									/* @__PURE__ */ jsx("span", {
										className: cn("tabular w-12 text-right text-xs font-semibold", band.text),
										children: sig ? `${sig.confidence.toFixed(1)}%` : "—"
									})
								]
							})
						]
					}) }, a.symbol);
				})
			})
		]
	});
}
// src/lib/engine/scanner.ts
function spec(family, label, wins) {
	let k = 0;
	for (let d = 0; d < 10; d++) if (wins(d)) k++;
	return {
		id: label.replace(" ", "_"),
		family,
		label,
		wins,
		baseline: k / 10
	};
}
var CONTRACTS = [
	spec("even_odd", "EVEN", (d) => d % 2 === 0),
	spec("even_odd", "ODD", (d) => d % 2 === 1),
	...Array.from({ length: 9 }, (_, b) => spec("over_under", `OVER ${b}`, (d) => d > b)),
	...Array.from({ length: 9 }, (_, i) => spec("over_under", `UNDER ${i + 1}`, (d) => d < i + 1)),
	...Array.from({ length: 10 }, (_, x) => spec("matches_differs", `MATCHES ${x}`, (d) => d === x)),
	...Array.from({ length: 10 }, (_, x) => spec("matches_differs", `DIFFERS ${x}`, (d) => d !== x))
];
/**
* Evaluates every contract on every market over several windows.
* Pure: reads engines, never mutates them.
*/
function scanMarkets(engines, opts) {
	const windows = [...opts.windows].sort((a, b) => a - b);
	const contracts = CONTRACTS.filter((c) => opts.families.includes(c.family));
	const hits = [];
	let tests = 0;
	let cleared = 0;
	for (const engine of engines) {
		const all = engine.digits;
		if (all.length < 30) continue;
		const probs = engine.nextDigitProbs();
		const windowCounts = windows.map((w) => {
			const digits = all.slice(-w);
			const c = new Array(10).fill(0);
			for (const d of digits) c[d]++;
			return {
				n: digits.length,
				c
			};
		});
		const tail = all.slice(-20);
		for (const ct of contracts) {
			let model = 0;
			for (let d = 0; d < 10; d++) if (ct.wins(d)) model += probs[d];
			const perWindow = [];
			let agree = 0;
			let sum = 0;
			let lead = null;
			const seen = /* @__PURE__ */ new Set();
			for (const { n, c } of windowCounts) {
				if (seen.has(n)) {
					perWindow.push(null);
					continue;
				}
				seen.add(n);
				let k = 0;
				for (let d = 0; d < 10; d++) if (ct.wins(d)) k += c[d];
				const s = makeSignal(ct.family, ct.label, k / n, model, ct.baseline, n);
				perWindow.push(s);
				tests++;
				sum += s.confidence;
				if (s.confidence >= opts.threshold) {
					agree++;
					cleared++;
				}
				if (!lead || s.confidence > lead.confidence) lead = s;
			}
			const evaluated = perWindow.filter(Boolean).length;
			if (!lead || agree === 0) continue;
			if (opts.requireAll && agree < evaluated) continue;
			let r = 0;
			for (const d of tail) if (ct.wins(d)) r++;
			hits.push({
				key: `${engine.symbol}:${ct.id}`,
				symbol: engine.symbol,
				contract: ct,
				perWindow,
				agree,
				meanConfidence: sum / evaluated,
				maxConfidence: lead.confidence,
				lead,
				recent: tail.length ? r / tail.length : 0
			});
		}
	}
	hits.sort((a, b) => b.agree - a.agree || b.meanConfidence - a.meanConfidence || b.lead.edge - a.lead.edge);
	return {
		at: Date.now(),
		hits,
		tests,
		expectedFalse: tests * (1 - opts.threshold / 100),
		cleared,
		markets: engines.length
	};
}
// src/components/engine/panel.tsx
function Panel({ title, icon: Icon, aside, children, className }) {
	return /* @__PURE__ */ jsxs("section", {
		className: cn("rounded-lg border bg-card/80", className),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-2 border-b px-4 py-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx(Icon, { className: "size-4 text-primary" }), /* @__PURE__ */ jsx("h2", {
					className: "font-display text-sm font-semibold uppercase tracking-wider",
					children: title
				})]
			}), aside]
		}), /* @__PURE__ */ jsx("div", {
			className: "p-4",
			children
		})]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ jsxs("div", {
		title: hint,
		className: "rounded-md border bg-background/40 px-3 py-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "tabular mt-0.5 text-sm font-semibold",
			children: value
		})]
	});
}
// src/components/engine/deep-scanner.tsx
var WINDOW_OPTIONS = [
	50,
	100,
	250,
	500,
	1e3
];
var THRESHOLDS = [
	70,
	87,
	95,
	98
];
var AUTO_OPTIONS = [
	0,
	10,
	30,
	60
];
var FAMILIES = [
	"matches_differs",
	"even_odd",
	"over_under"
];
var STEP_MS = 90;
var PAGE = 12;
function Segmented({ label, options, value, onChange, format }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "flex rounded-md border bg-background/40 p-0.5",
			role: "radiogroup",
			"aria-label": label,
			children: options.map((o) => /* @__PURE__ */ jsx("button", {
				role: "radio",
				"aria-checked": value === o,
				onClick: () => onChange(o),
				className: cn("tabular whitespace-nowrap rounded px-2 py-1 text-xs transition-colors", value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
				children: format ? format(o) : String(o)
			}, String(o)))
		})]
	});
}
function Toggles({ label, options, value, onChange, format }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap gap-1",
			children: options.map((o) => {
				const on = value.includes(o);
				return /* @__PURE__ */ jsx("button", {
					"aria-pressed": on,
					onClick: () => {
						const next = on ? value.filter((v) => v !== o) : [...value, o];
						if (next.length) onChange(next);
					},
					className: cn("tabular whitespace-nowrap rounded border px-2 py-1 text-xs transition-colors", on ? "border-primary/60 bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground"),
					children: format ? format(o) : String(o)
				}, String(o));
			})
		})]
	});
}
function DeepScanner({ engines, onFocus }) {
	const [windows, setWindows] = useState([
		100,
		250,
		1e3
	]);
	const [threshold, setThreshold] = useState(87);
	const [families, setFamilies] = useState(FAMILIES);
	const [requireAll, setRequireAll] = useState(false);
	const [auto, setAuto] = useState(0);
	const [result, setResult] = useState(null);
	const [fresh, setFresh] = useState(/* @__PURE__ */ new Set());
	const [progress, setProgress] = useState(null);
	const [showAll, setShowAll] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [selectedMarket, setSelectedMarket] = useState("ALL");
	const enginesRef = useRef(engines);
	const selectedMarketRef = useRef(selectedMarket);
	const optsRef = useRef({
		windows,
		threshold,
		families,
		requireAll
	});
	useEffect(() => {
		enginesRef.current = engines;
		selectedMarketRef.current = selectedMarket;
		optsRef.current = {
			windows,
			threshold,
			families,
			requireAll
		};
	}, [
		engines,
		selectedMarket,
		windows,
		threshold,
		families,
		requireAll
	]);
	const prevKeys = useRef(null);
	const timer = useRef(null);
	const runScan = useCallback(() => {
		if (timer.current !== null) return;
		const marketsToScan = selectedMarketRef.current === "ALL" ? MARKETS : MARKETS.filter((market) => market.symbol === selectedMarketRef.current);
		const scanEngines = enginesRef.current.filter((engine) => marketsToScan.some((market) => market.symbol === engine.symbol));
		let step = 0;
		setProgress(0);
		timer.current = window.setInterval(() => {
			step++;
			if (step < marketsToScan.length) {
				setProgress(step);
				return;
			}
			clearInterval(timer.current);
			timer.current = null;
			const r = scanMarkets(scanEngines, optsRef.current);
			const keys = new Set(r.hits.map((h) => h.key));
			const prev = prevKeys.current;
			setFresh(prev ? new Set([...keys].filter((k) => !prev.has(k))) : /* @__PURE__ */ new Set());
			prevKeys.current = keys;
			setResult(r);
			setProgress(null);
		}, STEP_MS);
	}, []);
	useEffect(() => () => {
		if (timer.current !== null) clearInterval(timer.current);
	}, []);
	const ready = engines.some((e) => (selectedMarket === "ALL" || e.symbol === selectedMarket) && e.digits.length >= 30);
	useEffect(() => {
		if (ready && !result && progress === null) runScan();
	}, [
		ready,
		result,
		progress,
		runScan
	]);
	useEffect(() => {
		if (!auto) return;
		const id = window.setInterval(() => {
			setCountdown((c) => {
				if (c <= 1) {
					runScan();
					return auto;
				}
				return c - 1;
			});
		}, 1e3);
		return () => clearInterval(id);
	}, [auto, runScan]);
	const settingsKey = `${selectedMarket}|${windows.join(",")}|${threshold}|${families.join(",")}|${requireAll}`;
	const lastSettings = useRef(settingsKey);
	useEffect(() => {
		if (lastSettings.current === settingsKey) return;
		lastSettings.current = settingsKey;
		prevKeys.current = null;
		setResult(null);
		setFresh(/* @__PURE__ */ new Set());
		if (timer.current !== null) {
			clearInterval(timer.current);
			timer.current = null;
		}
		setProgress(null);
		if (ready) runScan();
	}, [
		settingsKey,
		ready,
		runScan
	]);
	const scanning = progress !== null;
	const sortedWindows = [...windows].sort((a, b) => a - b);
	const hits = result?.hits ?? [];
	const visible = showAll ? hits : hits.slice(0, PAGE);
	const displayedMarkets = selectedMarket === "ALL" ? MARKETS : MARKETS.filter((m) => m.symbol === selectedMarket);
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-lg border bg-card/80",
		"aria-label": "Deep scanner",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(Radar, { className: cn("size-4 text-primary", scanning && "animate-spin") }),
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-sm font-semibold uppercase tracking-wider",
							children: "Deep scanner"
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "hidden text-[11px] text-muted-foreground sm:inline",
							children: [
								"40 contracts × ",
								displayedMarkets.length,
								" market",
								displayedMarkets.length === 1 ? "" : "s",
								" × ",
								windows.length,
								" windows"
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [auto > 0 && !scanning && /* @__PURE__ */ jsxs("span", {
						className: "tabular text-[11px] text-muted-foreground",
						children: [
							"next scan in ",
							countdown,
							"s"
						]
					}), /* @__PURE__ */ jsxs("button", {
						onClick: runScan,
						disabled: scanning || !ready,
						className: "flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
						children: [/* @__PURE__ */ jsx(RotateCw, { className: cn("size-3.5", scanning && "animate-spin") }), scanning ? "Scanning…" : "Scan now"]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-end gap-x-5 gap-y-3 border-b px-4 py-3",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "flex min-w-44 flex-col gap-1 text-[10px] uppercase tracking-wider text-muted-foreground",
						children: ["Select market for deep scan", /* @__PURE__ */ jsxs("select", {
							value: selectedMarket,
							onChange: (event) => setSelectedMarket(event.target.value),
							className: "h-8 rounded-md border bg-background px-2 text-xs normal-case tracking-normal text-foreground",
							children: [/* @__PURE__ */ jsx("option", {
								value: "ALL",
								children: "All 10 markets"
							}), MARKETS.map((market) => /* @__PURE__ */ jsxs("option", {
								value: market.symbol,
								children: [
									market.name,
									" (",
									market.symbol,
									")"
								]
							}, market.symbol))]
						})]
					}),
					/* @__PURE__ */ jsx(Toggles, {
						label: "Contract types",
						options: FAMILIES,
						value: families,
						onChange: setFamilies,
						format: (f) => FAMILY_LABEL[f]
					}),
					/* @__PURE__ */ jsx(Toggles, {
						label: "Windows (ticks)",
						options: WINDOW_OPTIONS,
						value: windows,
						onChange: setWindows
					}),
					/* @__PURE__ */ jsx(Segmented, {
						label: "Min confidence",
						options: THRESHOLDS,
						value: threshold,
						onChange: setThreshold,
						format: (t) => `${t}%`
					}),
					/* @__PURE__ */ jsx(Segmented, {
						label: "Auto scan",
						options: AUTO_OPTIONS,
						value: auto,
						onChange: (a) => {
							setAuto(a);
							setCountdown(a);
						},
						format: (a) => a ? `${a}s` : "Off"
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer items-center gap-2 pb-1 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: requireAll,
							onChange: (e) => setRequireAll(e.target.checked),
							className: "accent-[var(--primary)]"
						}), "All windows must agree"]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative h-8 overflow-hidden border-b bg-background/30",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-full",
					children: displayedMarkets.map((m, i) => {
						return /* @__PURE__ */ jsx("div", {
							className: cn("tabular flex flex-1 items-center justify-center border-r text-[10px] transition-colors last:border-r-0", scanning && i === progress ? "bg-primary/25 text-foreground" : (scanning ? i < progress : !!result) ? "text-primary" : "text-muted-foreground"),
							children: m.short
						}, m.symbol);
					})
				}), scanning && /* @__PURE__ */ jsx("div", { className: "scan-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent" })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "p-4",
				children: [
					result && /* @__PURE__ */ jsxs("div", {
						className: "mb-4 grid grid-cols-2 gap-2 md:grid-cols-4",
						children: [
							/* @__PURE__ */ jsx(Stat, {
								label: "Tests run",
								value: result.tests.toLocaleString()
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: `Cleared ≥${threshold}%`,
								value: result.cleared.toLocaleString(),
								hint: "Market × contract × window tests whose confidence cleared the threshold"
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: "Expected by chance",
								value: `≈ ${result.expectedFalse.toFixed(0)}`,
								hint: "How many tests would clear the threshold if every market were perfectly random"
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: "Last scan",
								value: new Date(result.at).toLocaleTimeString()
							})
						]
					}),
					result && /* @__PURE__ */ jsx("p", {
						className: "mb-3 text-[11px] leading-relaxed text-muted-foreground",
						children: result.cleared > result.expectedFalse * 1.5 ? /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-semibold text-primary",
								children: "More signals than chance alone predicts."
							}),
							" ",
							"Prefer hits where several windows agree."
						] }) : /* @__PURE__ */ jsx(Fragment, { children: "The number of hits is in line with what random digits would produce, so treat single-window hits as likely noise." })
					}),
					!result ? /* @__PURE__ */ jsx("p", {
						className: "py-10 text-center text-sm text-muted-foreground",
						children: ready ? "Running first scan…" : "Waiting for tick history…"
					}) : hits.length === 0 ? /* @__PURE__ */ jsxs("p", {
						className: "py-10 text-center text-sm text-muted-foreground",
						children: [
							"No contract clears ",
							threshold,
							"% confidence right now. Lower the threshold or add windows."
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "overflow-x-auto",
						children: [/* @__PURE__ */ jsxs("table", {
							className: "w-full min-w-[720px] text-xs",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b text-left text-[10px] uppercase tracking-wider text-muted-foreground",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 font-medium",
										children: "#"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 font-medium",
										children: "Market"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 font-medium",
										children: "Contract"
									}),
									sortedWindows.map((w) => /* @__PURE__ */ jsxs("th", {
										className: "py-2 pr-2 text-center font-medium",
										children: [w, "t"]
									}, w)),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Agree"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Prob."
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Edge"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-2 pr-3 text-right font-medium",
										children: "Last 20"
									}),
									/* @__PURE__ */ jsx("th", { className: "py-2" })
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y",
								children: visible.map((h, i) => /* @__PURE__ */ jsx(HitRow, {
									hit: h,
									rank: i + 1,
									fresh: fresh.has(h.key),
									threshold,
									onFocus
								}, h.key))
							})]
						}), hits.length > PAGE && /* @__PURE__ */ jsx("button", {
							onClick: () => setShowAll((s) => !s),
							className: "mt-3 w-full rounded-md border py-1.5 text-xs text-muted-foreground hover:bg-muted",
							children: showAll ? "Show top results" : `Show all ${hits.length} hits`
						})]
					})
				]
			})
		]
	});
}
function HitRow({ hit: h, rank, fresh, threshold, onFocus }) {
	const m = MARKET_BY_SYMBOL[h.symbol];
	const band = BAND_META[h.lead.band];
	const evaluated = h.perWindow.filter(Boolean).length;
	return /* @__PURE__ */ jsxs("tr", {
		className: "hover:bg-muted/40",
		children: [
			/* @__PURE__ */ jsx("td", {
				className: "tabular py-2 pr-3 text-muted-foreground",
				children: rank
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-2 pr-3",
				children: /* @__PURE__ */ jsx("span", {
					className: "font-display font-semibold",
					children: m.short
				})
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-2 pr-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: cn("tabular rounded px-1.5 py-0.5 font-semibold", band.bg, band.text),
						children: h.contract.label
					}), fresh && /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-0.5 rounded bg-accent/15 px-1 py-0.5 text-[9px] font-bold uppercase text-accent",
						children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-2.5" }), "New"]
					})]
				})
			}),
			h.perWindow.map((s, i) => /* @__PURE__ */ jsx("td", {
				className: "py-2 pr-2 text-center",
				children: s ? /* @__PURE__ */ jsx("span", {
					title: `${pct(s.probability)} est. vs ${pct(s.baseline)} baseline, z=${s.z.toFixed(2)}`,
					className: cn("tabular inline-block min-w-12 rounded px-1 py-0.5", s.confidence >= threshold ? cn(BAND_META[s.band].bg, BAND_META[s.band].text) : "text-muted-foreground"),
					children: s.confidence.toFixed(1)
				}) : /* @__PURE__ */ jsx("span", {
					className: "text-muted-foreground",
					children: "—"
				})
			}, i)),
			/* @__PURE__ */ jsx("td", {
				className: "tabular py-2 pr-3 text-right font-semibold",
				children: /* @__PURE__ */ jsxs("span", {
					className: cn(h.agree === evaluated && evaluated > 1 ? "text-primary" : "text-foreground"),
					children: [
						h.agree,
						"/",
						evaluated
					]
				})
			}),
			/* @__PURE__ */ jsx("td", {
				className: "tabular py-2 pr-3 text-right",
				children: pct(h.lead.probability)
			}),
			/* @__PURE__ */ jsxs("td", {
				className: cn("tabular py-2 pr-3 text-right font-semibold", h.lead.edge >= 0 ? "text-up" : "text-down"),
				children: [signed(h.lead.edge), "pp"]
			}),
			/* @__PURE__ */ jsx("td", {
				className: "tabular py-2 pr-3 text-right text-muted-foreground",
				children: pct(h.recent, 0)
			}),
			/* @__PURE__ */ jsx("td", {
				className: "py-2 text-right",
				children: /* @__PURE__ */ jsxs("button", {
					onClick: () => onFocus(h.symbol),
					title: "Open in focus dashboard",
					className: "inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] text-muted-foreground hover:border-primary/60 hover:text-foreground",
					children: [/* @__PURE__ */ jsx(Crosshair, { className: "size-3" }), "Focus"]
				})
			})
		]
	});
}
// src/components/engine/market-overview.tsx
function MarketOverview({ engine, analysis }) {
	const m = MARKET_BY_SYMBOL[engine.symbol];
	const [head, tail] = splitQuote(analysis.lastQuote, engine.pip);
	const prices = engine.prices.slice(-150);
	const digits = engine.digits.slice(-150);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Live tick stream",
		icon: LineChart,
		aside: /* @__PURE__ */ jsxs("span", {
			className: "tabular text-[11px] text-muted-foreground",
			children: [
				m.interval,
				"s ticks · pip ",
				engine.pip
			]
		}),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs text-muted-foreground",
					children: m.name
				}), /* @__PURE__ */ jsxs("div", {
					className: "tabular flex items-baseline text-4xl font-bold tracking-tight md:text-5xl",
					children: [/* @__PURE__ */ jsx("span", { children: head }), /* @__PURE__ */ jsx("span", {
						className: cn("tick-flash rounded px-1", analysis.change >= 0 ? "text-up" : "text-down"),
						children: tail
					}, `${analysis.n}-${analysis.lastQuote}`)]
				})] }), /* @__PURE__ */ jsx("div", {
					className: "flex gap-1.5",
					"aria-label": "Last 12 digits",
					children: digits.slice(-12).map((d, i, arr) => /* @__PURE__ */ jsx("span", {
						className: cn("tabular grid size-7 place-items-center rounded text-sm font-semibold", i === arr.length - 1 ? "bg-accent text-accent-foreground" : d % 2 === 0 ? "bg-chart-1/15 text-chart-1" : "bg-chart-4/15 text-chart-4"),
						children: d
					}, i))
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(PriceStream, {
					prices,
					digits,
					pip: engine.pip
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "Ticks analysed",
						value: analysis.n.toLocaleString()
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Realised vol",
						value: `${analysis.volatility.toFixed(2)} bps`,
						hint: "Std. dev. of tick log-returns"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Digit entropy",
						value: pct(analysis.entropy, 2),
						hint: "100% = perfectly uniform digits"
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Current streak",
						value: `${analysis.streak.length}× ${analysis.streak.kind}`,
						hint: "Consecutive same-parity last digits"
					})
				]
			})
		]
	});
}
// src/components/engine/digit-distribution.tsx
function DigitDistribution({ analysis }) {
	const max = Math.max(.14, ...analysis.freq);
	const hot = analysis.freq.indexOf(Math.max(...analysis.freq));
	const cold = analysis.freq.indexOf(Math.min(...analysis.freq));
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Digit skew",
		icon: BarChart3,
		aside: /* @__PURE__ */ jsxs("span", {
			className: "tabular text-[11px] text-muted-foreground",
			children: [
				"χ² ",
				analysis.chi2.toFixed(1),
				" · p ",
				analysis.chi2P.toFixed(3)
			]
		}),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-10 gap-1.5 text-center",
				children: analysis.freq.map((f, d) => {
					const z = analysis.digitZ[d];
					return /* @__PURE__ */ jsx("span", {
						className: cn("tabular text-[10px]", z > 1.5 ? "text-accent" : z < -1.5 ? "text-down" : "text-muted-foreground"),
						children: (f * 100).toFixed(1)
					}, d);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mt-1 grid h-36 grid-cols-10 items-end gap-1.5 border-b",
				children: [/* @__PURE__ */ jsx("div", {
					className: "pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/40",
					style: { bottom: `${.1 / max * 100}%` },
					title: "Uniform baseline (10%)"
				}), analysis.freq.map((f, d) => /* @__PURE__ */ jsx("div", {
					className: cn("w-full rounded-t transition-all duration-500", d === hot ? "bg-accent" : d === cold ? "bg-down/80" : "bg-primary/70"),
					style: { height: `${f / max * 100}%` }
				}, d))]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-2 grid grid-cols-10 gap-1.5 justify-items-center",
				children: analysis.freq.map((_, d) => /* @__PURE__ */ jsx("span", {
					className: cn("tabular grid size-6 place-items-center rounded-full text-xs font-bold", analysis.lastDigit === d ? "bg-accent text-accent-foreground ring-2 ring-accent/40" : "bg-muted"),
					children: d
				}, d))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 grid grid-cols-3 gap-2 text-center text-xs",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-md bg-accent/10 px-2 py-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-muted-foreground",
							children: "Hottest"
						}), /* @__PURE__ */ jsxs("div", {
							className: "tabular font-semibold text-accent",
							children: [
								hot,
								" · z ",
								analysis.digitZ[hot].toFixed(2)
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-md bg-down/10 px-2 py-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-muted-foreground",
							children: "Coldest"
						}), /* @__PURE__ */ jsxs("div", {
							className: "tabular font-semibold text-down",
							children: [
								cold,
								" · z ",
								analysis.digitZ[cold].toFixed(2)
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rounded-md bg-primary/10 px-2 py-1.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-muted-foreground",
							children: "Skew score"
						}), /* @__PURE__ */ jsxs("div", {
							className: "tabular font-semibold text-primary",
							children: [analysis.skewScore.toFixed(1), "%"]
						})]
					})
				]
			})
		]
	});
}
// src/components/engine/probability-engine.tsx
function ProbabilityEngine({ analysis }) {
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Probability engine",
		icon: Gauge,
		aside: /* @__PURE__ */ jsx("span", {
			className: "text-[11px] text-muted-foreground",
			children: "signal band 87–98% = strong"
		}),
		children: [/* @__PURE__ */ jsx("div", {
			className: "grid gap-3 md:grid-cols-3",
			children: analysis.signals.map((s) => /* @__PURE__ */ jsx(SignalCard, { signal: s }, s.family))
		}), /* @__PURE__ */ jsx(OverUnderLadder, { analysis })]
	});
}
function SignalCard({ signal: s }) {
	const band = BAND_META[s.band];
	const r = 34;
	const c = 2 * Math.PI * r;
	const arc = s.confidence / 100 * c * .75;
	return /* @__PURE__ */ jsxs("div", {
		className: cn("rounded-lg border p-3", s.band === "strong" || s.band === "extreme" ? "border-primary/40" : ""),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: FAMILY_LABEL[s.family]
			}), /* @__PURE__ */ jsx("span", {
				className: cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", band.bg, band.text),
				children: band.label
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-2 flex items-center gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative size-20 shrink-0",
				children: [/* @__PURE__ */ jsxs("svg", {
					viewBox: "0 0 80 80",
					className: "size-20 rotate-[135deg]",
					"aria-hidden": true,
					children: [/* @__PURE__ */ jsx("circle", {
						cx: "40",
						cy: "40",
						r,
						fill: "none",
						stroke: "var(--muted)",
						strokeWidth: "6",
						strokeDasharray: `${c * .75} ${c}`,
						strokeLinecap: "round"
					}), /* @__PURE__ */ jsx("circle", {
						cx: "40",
						cy: "40",
						r,
						fill: "none",
						stroke: "currentColor",
						className: cn(band.text, "transition-all duration-700"),
						strokeWidth: "6",
						strokeDasharray: `${arc} ${c}`,
						strokeLinecap: "round"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 grid place-items-center",
					children: /* @__PURE__ */ jsxs("div", {
						className: "text-center",
						children: [/* @__PURE__ */ jsx("div", {
							className: cn("tabular text-base font-bold leading-none", band.text),
							children: s.confidence.toFixed(1)
						}), /* @__PURE__ */ jsx("div", {
							className: "text-[9px] text-muted-foreground",
							children: "conf %"
						})]
					})
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("div", {
					className: "font-display text-xl font-bold",
					children: s.label
				}), /* @__PURE__ */ jsxs("dl", {
					className: "tabular mt-1 grid grid-cols-[auto_auto] gap-x-3 text-xs",
					children: [
						/* @__PURE__ */ jsx("dt", {
							className: "text-muted-foreground",
							children: "Est. prob"
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-right",
							children: pct(s.probability)
						}),
						/* @__PURE__ */ jsx("dt", {
							className: "text-muted-foreground",
							children: "Baseline"
						}),
						/* @__PURE__ */ jsx("dd", {
							className: "text-right",
							children: pct(s.baseline)
						}),
						/* @__PURE__ */ jsx("dt", {
							className: "text-muted-foreground",
							children: "Edge"
						}),
						/* @__PURE__ */ jsxs("dd", {
							className: cn("text-right font-semibold", s.edge >= 0 ? "text-up" : "text-down"),
							children: [signed(s.edge, 2), " pp"]
						})
					]
				})]
			})]
		})]
	});
}
function OverUnderLadder({ analysis }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-2 text-[11px] uppercase tracking-wider text-muted-foreground",
			children: "Over barrier ladder · observed vs expected"
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-9 gap-1",
			children: analysis.overRates.slice(0, 9).map((r, b) => {
				const exp = (9 - b) / 10;
				const diff = (r - exp) * 100;
				return /* @__PURE__ */ jsxs("div", {
					className: "rounded border bg-background/40 px-1 py-1.5 text-center",
					title: `Over ${b}: ${pct(r)} vs ${pct(exp, 0)} expected`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "text-[10px] text-muted-foreground",
							children: [">", b]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "tabular text-xs font-semibold",
							children: (r * 100).toFixed(1)
						}),
						/* @__PURE__ */ jsx("div", {
							className: cn("tabular text-[10px]", diff >= 0 ? "text-up" : "text-down"),
							children: signed(diff)
						})
					]
				}, b);
			})
		})]
	});
}
// src/components/engine/neural-patterns.tsx
function NeuralPatterns({ analysis, steps }) {
	const probs = analysis.modelProbs;
	const top = probs.indexOf(Math.max(...probs));
	const maxP = Math.max(.15, ...probs);
	const cur = analysis.lastDigit;
	const row = cur !== null ? analysis.transitions[cur] : null;
	return /* @__PURE__ */ jsx(Panel, {
		title: "Neural pattern recognition",
		icon: BrainCircuit,
		aside: /* @__PURE__ */ jsxs("span", {
			className: "tabular text-[11px] text-muted-foreground",
			children: [steps.toLocaleString(), " training steps"]
		}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid gap-5 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ jsx("span", { children: "Next-digit forecast" }), /* @__PURE__ */ jsxs("span", { children: ["top: ", /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-accent",
						children: top
					})] })]
				}),
				/* @__PURE__ */ jsx("ul", {
					className: "space-y-1",
					children: probs.map((p, d) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "tabular w-3 text-xs font-semibold",
								children: d
							}),
							/* @__PURE__ */ jsx("div", {
								className: "h-3 flex-1 overflow-hidden rounded-sm bg-muted",
								children: /* @__PURE__ */ jsx("div", {
									className: cn("h-full rounded-sm transition-all duration-500", d === top ? "bg-accent" : "bg-chart-4/70"),
									style: { width: `${p / maxP * 100}%` }
								})
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "tabular w-12 text-right text-xs",
								children: [(p * 100).toFixed(2), "%"]
							})
						]
					}, d))
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-xs leading-relaxed text-muted-foreground",
					children: "A softmax network trained online on every tick, using the last three digits and five-tick parity rhythm as features. Predictions are scored before each update so accuracy stays honest."
				})
			] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground",
				children: [/* @__PURE__ */ jsx("span", { children: "Transition matrix (from → to)" }), row && cur !== null && /* @__PURE__ */ jsxs("span", { children: [
					"after ",
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-accent",
						children: cur
					}),
					" →",
					" ",
					row.indexOf(Math.max(...row))
				] })]
			}), /* @__PURE__ */ jsx(TransitionHeatmap, {
				matrix: analysis.transitions,
				current: cur
			})] })]
		})
	});
}
function TransitionHeatmap({ matrix, current }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-[auto_repeat(10,1fr)] gap-px text-[9px]",
		role: "table",
		"aria-label": "Digit transition probabilities",
		children: [
			/* @__PURE__ */ jsx("span", {}),
			matrix.map((_, j) => /* @__PURE__ */ jsx("span", {
				className: "tabular text-center text-muted-foreground",
				children: j
			}, j)),
			matrix.map((rowV, i) => /* @__PURE__ */ jsx(Row, {
				i,
				row: rowV,
				active: i === current
			}, i))
		]
	});
}
function Row({ i, row, active }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		className: cn("tabular pr-1 text-right", active ? "font-bold text-accent" : "text-muted-foreground"),
		children: i
	}), row.map((p, j) => {
		const t = Math.max(-1, Math.min(1, (p - .1) / .06));
		const bg = t >= 0 ? `color-mix(in oklch, var(--accent) ${Math.round(t * 85)}%, var(--muted))` : `color-mix(in oklch, var(--chart-4) ${Math.round(-t * 70)}%, var(--muted))`;
		return /* @__PURE__ */ jsx("span", {
			title: `${i} → ${j}: ${(p * 100).toFixed(1)}%`,
			className: cn("aspect-square rounded-[2px]", active && "ring-1 ring-accent/60"),
			style: { background: bg }
		}, j);
	})] });
}
// src/components/engine/accuracy-estimator.tsx
function AccuracyEstimator({ analysis }) {
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Accuracy advantage estimator",
		icon: Target,
		aside: /* @__PURE__ */ jsx("span", {
			className: "text-[11px] text-muted-foreground",
			children: "walk-forward · last 500 predictions"
		}),
		children: [/* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children: analysis.accuracy.map((a) => {
				const lo = Math.max(0, a.baseline - .15);
				const hi = Math.min(1, a.baseline + .15);
				const pos = (v) => `${(Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo) * 100}%`;
				const significant = a.ci[0] > a.baseline;
				return /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline justify-between text-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: CONTRACT_LABEL[a.contract]
						}), /* @__PURE__ */ jsxs("span", {
							className: "tabular",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-semibold",
									children: pct(a.rate)
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-muted-foreground",
									children: [
										" ",
										"vs ",
										pct(a.baseline, 0),
										" ·",
										" "
									]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: cn("font-semibold", a.advantage >= 0 ? "text-up" : "text-down"),
									children: [signed(a.advantage), " pp"]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative mt-1.5 h-2.5 rounded-full bg-muted",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: cn("absolute inset-y-0 rounded-full", significant ? "bg-accent/50" : "bg-primary/35"),
								style: {
									left: pos(a.ci[0]),
									width: `calc(${pos(a.ci[1])} - ${pos(a.ci[0])})`
								}
							}),
							/* @__PURE__ */ jsx("div", {
								className: "absolute inset-y-[-3px] w-px bg-foreground/60",
								style: { left: pos(a.baseline) }
							}),
							/* @__PURE__ */ jsx("div", {
								className: cn("absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background", significant ? "bg-accent" : "bg-primary"),
								style: { left: pos(a.rate) }
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tabular mt-1 text-[10px] text-muted-foreground",
						children: [
							"95% CI ",
							pct(a.ci[0]),
							" – ",
							pct(a.ci[1]),
							" · n=",
							a.n,
							significant && /* @__PURE__ */ jsx("span", {
								className: "ml-1 font-semibold text-accent",
								children: "· beats baseline"
							})
						]
					})
				] }, a.contract);
			})
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-4 rounded-md border border-dashed px-3 py-2 text-[11px] leading-relaxed text-muted-foreground",
			children: "Each tick, the model commits to a prediction before seeing the result. This panel shows the realised hit rate against the random baseline, so you can see whether a confidence reading is translating into a real advantage."
		})]
	});
}
// src/components/engine/historical-insight.tsx
function HistoricalInsight({ engine }) {
	const digits = engine.digits;
	const segSize = 50;
	const heat = rollingHeatmap(digits, 40, segSize);
	const evenSeries = rollingRate(digits, 100, (d) => d % 2 === 0);
	const overSeries = rollingRate(digits, 100, (d) => d > 4);
	const recent = digits.slice(-100);
	return /* @__PURE__ */ jsxs(Panel, {
		title: "Historical insight",
		icon: History,
		aside: /* @__PURE__ */ jsxs("span", {
			className: "tabular text-[11px] text-muted-foreground",
			children: [digits.length.toLocaleString(), " ticks in memory"]
		}),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "text-[11px] uppercase tracking-wider text-muted-foreground",
				children: [
					"Digit frequency drift · ",
					segSize,
					"-tick windows (oldest → newest)"
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ jsx("div", {
					className: "tabular flex flex-col justify-between py-px text-[9px] text-muted-foreground",
					children: Array.from({ length: 10 }, (_, d) => /* @__PURE__ */ jsx("span", {
						className: "leading-none",
						children: d
					}, d))
				}), /* @__PURE__ */ jsx("div", {
					className: "grid flex-1 gap-px",
					style: { gridTemplateColumns: `repeat(${Math.max(heat.length, 1)}, 1fr)` },
					children: heat.map((col, i) => /* @__PURE__ */ jsx("div", {
						className: "grid grid-rows-10 gap-px",
						children: col.map((f, d) => {
							const t = Math.max(-1, Math.min(1, (f - .1) / .08));
							const bg = t >= 0 ? `color-mix(in oklch, var(--primary) ${Math.round(t * 90)}%, var(--muted))` : `color-mix(in oklch, var(--down) ${Math.round(-t * 60)}%, var(--muted))`;
							return /* @__PURE__ */ jsx("span", {
								className: "h-3 rounded-[1px]",
								style: { background: bg },
								title: `Digit ${d}: ${(f * 100).toFixed(0)}%`
							}, d);
						})
					}, i))
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ jsx("span", { children: "Even rate · rolling 100" }), /* @__PURE__ */ jsx("span", {
						className: "tabular text-chart-1",
						children: evenSeries.length ? `${(evenSeries[evenSeries.length - 1] * 100).toFixed(0)}%` : "—"
					})]
				}), /* @__PURE__ */ jsx(RateLine, {
					series: evenSeries,
					baseline: .5,
					color: "var(--chart-1)",
					label: "Rolling even rate"
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ jsx("span", { children: "Over 4 rate · rolling 100" }), /* @__PURE__ */ jsx("span", {
						className: "tabular text-chart-3",
						children: overSeries.length ? `${(overSeries[overSeries.length - 1] * 100).toFixed(0)}%` : "—"
					})]
				}), /* @__PURE__ */ jsx(RateLine, {
					series: overSeries,
					baseline: .5,
					color: "var(--chart-3)",
					label: "Rolling over-4 rate"
				})] })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 text-[11px] uppercase tracking-wider text-muted-foreground",
				children: "Last 100 digits"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-2 grid grid-cols-20 gap-1",
				children: recent.map((d, i) => /* @__PURE__ */ jsx("span", {
					className: cn("tabular grid aspect-square place-items-center rounded-sm text-[10px] font-semibold", i === recent.length - 1 ? "bg-accent text-accent-foreground" : d % 2 === 0 ? "bg-chart-1/15 text-chart-1" : "bg-chart-4/15 text-chart-4"),
					children: d
				}, i))
			})
		]
	});
}
// src/routes/index.tsx?tsr-split=component
var WINDOWS = [
	100,
	250,
	500,
	1e3,
	5e3
];
function EngineDashboard() {
	const { feed, frame, snapshot } = useMarketFeed();
	const [selected, setSelected] = useState("R_100");
	const [windowSize, setWindowSize] = useState(1e3);
	const [filter, setFilter] = useState("all");
	const rows = useMemo(() => {
		if (!feed) return [];
		return MARKETS.map((market) => {
			const engine = feed.engines.get(market.symbol);
			return {
				analysis: analyze(engine, windowSize),
				pip: engine.pip,
				spark: engine.prices.slice(-40)
			};
		});
	}, [
		feed,
		frame,
		windowSize
	]);
	const engines = useMemo(() => feed ? MARKETS.map((market) => feed.engines.get(market.symbol)) : [], [feed]);
	const focusFromScanner = (symbol) => {
		setSelected(symbol);
		document.getElementById("focus-market")?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};
	const engine = feed?.engines.get(selected);
	const focus = rows.find((row) => row.analysis.symbol === selected)?.analysis;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ jsx(StatusBar, {
			snapshot,
			marketCount: MARKETS.length
		}), /* @__PURE__ */ jsxs("main", {
			className: "mx-auto max-w-content px-4 py-5",
			children: [
				/* @__PURE__ */ jsx(DerivAccount, {}),
				/* @__PURE__ */ jsx("div", {
					className: "mb-6",
					children: engines.length ? /* @__PURE__ */ jsx(DeepScanner, {
						engines,
						onFocus: focusFromScanner
					}) : /* @__PURE__ */ jsx(Skeleton, { className: "h-72" })
				}),
				/* @__PURE__ */ jsxs("div", {
					id: "focus-market",
					className: "mb-5 flex scroll-mt-20 flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "tabular text-[11px] uppercase tracking-[0.25em] text-primary",
						children: "Focus market"
					}), /* @__PURE__ */ jsx("h2", {
						className: "font-display text-2xl font-bold md:text-3xl",
						children: MARKET_BY_SYMBOL[selected]?.name ?? selected
					})] }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-muted-foreground",
							children: "Analysis window"
						}), /* @__PURE__ */ jsx("div", {
							className: "flex rounded-md border bg-card p-0.5",
							role: "radiogroup",
							"aria-label": "Analysis window",
							children: WINDOWS.map((window) => /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "radio",
								"aria-checked": windowSize === window,
								onClick: () => setWindowSize(window),
								className: cn("tabular rounded px-2.5 py-1 text-xs transition-colors", windowSize === window ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
								children: window === 5e3 ? "All" : window
							}, window))
						})]
					})]
				}),
				snapshot.status === "simulated" && /* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex items-start gap-2 rounded-md border border-chart-4/40 bg-chart-4/10 px-3 py-2 text-xs",
					children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 size-4 shrink-0 text-chart-4" }), /* @__PURE__ */ jsx("span", { children: "The live market feed is unreachable, so the engine is running on a local simulated stream. It keeps retrying and switches back to live data automatically." })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-4 lg:grid-cols-[20rem_1fr]",
					children: [/* @__PURE__ */ jsx("aside", {
						className: "lg:sticky lg:top-20 lg:self-start",
						children: rows.length ? /* @__PURE__ */ jsx(MarketScanner, {
							rows,
							selected,
							onSelect: setSelected,
							filter,
							onFilter: setFilter
						}) : /* @__PURE__ */ jsx(Skeleton, { className: "h-[600px]" })
					}), engine && focus && focus.n > 0 ? /* @__PURE__ */ jsxs("div", {
						className: "grid min-w-0 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-4 xl:grid-cols-[1.6fr_1fr]",
								children: [/* @__PURE__ */ jsx(MarketOverview, {
									engine,
									analysis: focus
								}), /* @__PURE__ */ jsx(DigitDistribution, { analysis: focus })]
							}),
							/* @__PURE__ */ jsx(ProbabilityEngine, { analysis: focus }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-4 xl:grid-cols-[1.4fr_1fr]",
								children: [/* @__PURE__ */ jsx(NeuralPatterns, {
									analysis: focus,
									steps: engine.net.steps
								}), /* @__PURE__ */ jsx(AccuracyEstimator, { analysis: focus })]
							}),
							/* @__PURE__ */ jsx(HistoricalInsight, { engine })
						]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ jsx(Skeleton, { className: "h-80" }),
							/* @__PURE__ */ jsx(Skeleton, { className: "h-56" }),
							/* @__PURE__ */ jsx("p", {
								className: "text-center text-sm text-muted-foreground",
								children: "Loading tick history for all markets…"
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx("footer", {
					className: "mt-8 border-t pt-4 text-[11px] leading-relaxed text-muted-foreground",
					children: "Confidence scores measure how unlikely the observed digit skew is under pure chance; they are not a win-rate guarantee. Volatility Indices are designed to be random. Always check the walk-forward accuracy panel and trade responsibly."
				})
			]
		})]
	});
}
export { EngineDashboard as component };
