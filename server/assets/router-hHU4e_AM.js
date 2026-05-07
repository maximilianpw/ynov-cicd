import { createContext, useEffect, useState } from "react";
import { HeadContent, ScriptOnce, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { CheckCircleIcon, InfoIcon, SpinnerIcon, WarningIcon, XCircleIcon } from "@phosphor-icons/react";
//#region src/styles.css?url
var styles_default = "/assets/styles-CaJh88BY.css";
//#endregion
//#region src/components/providers/theme-provider.tsx
function getThemeScript(storageKey, defaultTheme) {
	return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${JSON.stringify(defaultTheme)}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`;
}
var ThemeProviderContext = createContext({
	theme: "system",
	setTheme: () => {}
});
function applyTheme(theme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	const resolved = theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}
function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme" }) {
	const [theme, setThemeState] = useState(defaultTheme);
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem(storageKey);
		setThemeState(stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme);
		setMounted(true);
	}, [defaultTheme, storageKey]);
	useEffect(() => {
		if (!mounted) return;
		applyTheme(theme);
	}, [theme, mounted]);
	useEffect(() => {
		if (!mounted || theme !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme, mounted]);
	const setTheme = (next) => {
		localStorage.setItem(storageKey, next);
		setThemeState(next);
	};
	return /* @__PURE__ */ jsxs(ThemeProviderContext, {
		value: {
			theme,
			setTheme
		},
		children: [/* @__PURE__ */ jsx(ScriptOnce, { children: getThemeScript(storageKey, defaultTheme) }), children]
	});
}
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	const { theme = "system" } = useTheme();
	return /* @__PURE__ */ jsx(Toaster, {
		theme,
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ jsx(CheckCircleIcon, { className: "size-4" }),
			info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
			warning: /* @__PURE__ */ jsx(WarningIcon, { className: "size-4" }),
			error: /* @__PURE__ */ jsx(XCircleIcon, { className: "size-4" }),
			loading: /* @__PURE__ */ jsx(SpinnerIcon, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		toastOptions: { classNames: { toast: "cn-toast" } },
		...props
	});
};
//#endregion
//#region src/routes/__root.tsx
var Route$1 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "TanStack Start Starter" }
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsx("body", { children: /* @__PURE__ */ jsxs(ThemeProvider, {
			defaultTheme: "dark",
			children: [
				children,
				/* @__PURE__ */ jsx(Scripts, {}),
				/* @__PURE__ */ jsx(Toaster$1, {})
			]
		}) })]
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter = () => import("./routes-DK_TqukC.js");
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = { IndexRoute: createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") }).update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$1
}) };
var routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { getRouter };
