import * as React from "react";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { Input } from "@base-ui/react/input";
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
			outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
			ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
			destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			icon: "size-8",
			"icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-7 rounded-none",
			"icon-lg": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button$1({ className, variant = "default", size = "default", ...props }) {
	return /* @__PURE__ */ jsx(Button, {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region src/lib/validators.ts
var textPattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
var postalCodePattern = /^\d{5}$/;
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function calculateAge(birthDate, today = /* @__PURE__ */ new Date()) {
	const birth = new Date(birthDate);
	if (Number.isNaN(birth.getTime())) return NaN;
	let age = today.getFullYear() - birth.getFullYear();
	if (!(today.getMonth() > birth.getMonth() || today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())) age -= 1;
	return age;
}
function isAdult(birthDate, today = /* @__PURE__ */ new Date()) {
	return calculateAge(birthDate, today) >= 18;
}
function isValidPostalCode(value) {
	return postalCodePattern.test(value.trim());
}
function isValidText(value) {
	return textPattern.test(value.trim());
}
function isValidEmail(value) {
	return emailPattern.test(value.trim());
}
function validateRegistration(values, today = /* @__PURE__ */ new Date()) {
	const errors = {};
	if (!isValidText(values.name)) errors.name = "Le nom est invalide.";
	if (!isValidText(values.prenom)) errors.prenom = "Le prénom est invalide.";
	if (!isValidEmail(values.email)) errors.email = "L'email est invalide.";
	if (!isAdult(values.dateNaissance, today)) errors.dateNaissance = "Vous devez avoir au moins 18 ans.";
	if (!isValidText(values.ville)) errors.ville = "La ville est invalide.";
	if (!isValidPostalCode(values.codePostal)) errors.codePostal = "Le code postal doit contenir 5 chiffres.";
	return errors;
}
//#endregion
//#region src/components/ui/calendar.tsx
function Calendar({ className, classNames, showOutsideDays = true, captionLayout = "label", buttonVariant = "ghost", locale, formatters, components, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	return /* @__PURE__ */ jsx(DayPicker, {
		showOutsideDays,
		className: cn("group/calendar bg-background p-2 [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent", String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`, String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`, className),
		captionLayout,
		locale,
		formatters: {
			formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" }),
			...formatters
		},
		classNames: {
			root: cn("w-fit", defaultClassNames.root),
			months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
			month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
			nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
			button_previous: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50", defaultClassNames.button_previous),
			button_next: cn(buttonVariants({ variant: buttonVariant }), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50", defaultClassNames.button_next),
			month_caption: cn("flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)", defaultClassNames.month_caption),
			dropdowns: cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", defaultClassNames.dropdowns),
			dropdown_root: cn("relative rounded-(--cell-radius)", defaultClassNames.dropdown_root),
			dropdown: cn("absolute inset-0 bg-popover opacity-0", defaultClassNames.dropdown),
			caption_label: cn("font-medium select-none", captionLayout === "label" ? "text-sm" : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground", defaultClassNames.caption_label),
			table: "w-full border-collapse",
			weekdays: cn("flex", defaultClassNames.weekdays),
			weekday: cn("flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none", defaultClassNames.weekday),
			week: cn("mt-2 flex w-full", defaultClassNames.week),
			week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
			week_number: cn("text-[0.8rem] text-muted-foreground select-none", defaultClassNames.week_number),
			day: cn("group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)", props.showWeekNumber ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)" : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)", defaultClassNames.day),
			range_start: cn("relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted", defaultClassNames.range_start),
			range_middle: cn("rounded-none", defaultClassNames.range_middle),
			range_end: cn("relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted", defaultClassNames.range_end),
			today: cn("rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none", defaultClassNames.today),
			outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
			disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
			hidden: cn("invisible", defaultClassNames.hidden),
			...classNames
		},
		components: {
			Root: ({ className, rootRef, ...props }) => {
				return /* @__PURE__ */ jsx("div", {
					"data-slot": "calendar",
					ref: rootRef,
					className: cn(className),
					...props
				});
			},
			Chevron: ({ className, orientation, ...props }) => {
				if (orientation === "left") return /* @__PURE__ */ jsx(CaretLeftIcon, {
					className: cn("size-4", className),
					...props
				});
				if (orientation === "right") return /* @__PURE__ */ jsx(CaretRightIcon, {
					className: cn("size-4", className),
					...props
				});
				return /* @__PURE__ */ jsx(CaretDownIcon, {
					className: cn("size-4", className),
					...props
				});
			},
			DayButton: ({ ...props }) => /* @__PURE__ */ jsx(CalendarDayButton, {
				locale,
				...props
			}),
			WeekNumber: ({ children, ...props }) => {
				return /* @__PURE__ */ jsx("td", {
					...props,
					children: /* @__PURE__ */ jsx("div", {
						className: "flex size-(--cell-size) items-center justify-center text-center",
						children
					})
				});
			},
			...components
		},
		...props
	});
}
function CalendarDayButton({ className, day, modifiers, locale, ...props }) {
	const defaultClassNames = getDefaultClassNames();
	const ref = React.useRef(null);
	React.useEffect(() => {
		if (modifiers.focused) ref.current?.focus();
	}, [modifiers.focused]);
	return /* @__PURE__ */ jsx(Button$1, {
		variant: "ghost",
		size: "icon",
		"data-day": day.date.toLocaleDateString(locale?.code),
		"data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
		"data-range-start": modifiers.range_start,
		"data-range-end": modifiers.range_end,
		"data-range-middle": modifiers.range_middle,
		className: cn("relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70", defaultClassNames.day, className),
		...props
	});
}
//#endregion
//#region src/components/ui/card.tsx
function Card({ className, size = "default", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card",
		"data-size": size,
		className: cn("group/card flex flex-col gap-4 overflow-hidden rounded-none bg-card py-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none", className),
		...props
	});
}
//#endregion
//#region src/components/ui/label.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-xs leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
//#region src/components/ui/field.tsx
function FieldSet({ className, ...props }) {
	return /* @__PURE__ */ jsx("fieldset", {
		"data-slot": "field-set",
		className: cn("flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className),
		...props
	});
}
function FieldLegend({ className, variant = "legend", ...props }) {
	return /* @__PURE__ */ jsx("legend", {
		"data-slot": "field-legend",
		"data-variant": variant,
		className: cn("mb-2.5 font-medium data-[variant=label]:text-xs data-[variant=legend]:text-sm", className),
		...props
	});
}
function FieldGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "field-group",
		className: cn("group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4", className),
		...props
	});
}
var fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
	variants: { orientation: {
		vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
		horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
	} },
	defaultVariants: { orientation: "vertical" }
});
function Field({ className, orientation = "vertical", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"data-slot": "field",
		"data-orientation": orientation,
		className: cn(fieldVariants({ orientation }), className),
		...props
	});
}
function FieldLabel({ className, ...props }) {
	return /* @__PURE__ */ jsx(Label, {
		"data-slot": "field-label",
		className: cn("group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border *:data-[slot=field]:p-2 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col", className),
		...props
	});
}
function FieldDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx("p", {
		"data-slot": "field-description",
		className: cn("text-left text-xs/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5", "last:mt-0 nth-last-2:-mt-1", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", className),
		...props
	});
}
function FieldError({ className, children, errors, ...props }) {
	const content = useMemo(() => {
		if (children) return children;
		if (!errors?.length) return null;
		const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];
		if (uniqueErrors?.length == 1) return uniqueErrors[0]?.message;
		return /* @__PURE__ */ jsx("ul", {
			className: "ml-4 flex list-disc flex-col gap-1",
			children: uniqueErrors.map((error, index) => error?.message && /* @__PURE__ */ jsx("li", { children: error.message }, index))
		});
	}, [children, errors]);
	if (!content) return null;
	return /* @__PURE__ */ jsx("div", {
		role: "alert",
		"data-slot": "field-error",
		className: cn("text-xs font-normal text-destructive", className),
		...props,
		children: content
	});
}
//#endregion
//#region src/components/ui/input.tsx
function Input$1({ className, type, ...props }) {
	return /* @__PURE__ */ jsx(Input, {
		type,
		"data-slot": "input",
		className: cn("h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
//#endregion
//#region src/components/RegistrationForm.tsx
var emptyForm = {
	name: "",
	prenom: "",
	email: "",
	dateNaissance: "",
	ville: "",
	codePostal: ""
};
function RegistrationForm() {
	const [values, setValues] = useState(emptyForm);
	const [errors, setErrors] = useState({});
	const updateField = (field, value) => {
		const nextValues = {
			...values,
			[field]: value
		};
		setValues(nextValues);
		if (errors[field]) setErrors(validateRegistration(nextValues));
	};
	const validateField = () => {
		setErrors(validateRegistration(values));
	};
	const saveRegistration = (event) => {
		event.preventDefault();
		setErrors(validateRegistration(values));
		setValues(emptyForm);
		toast("Inscription sauvegardée avec succès.");
	};
	return /* @__PURE__ */ jsx(Card, {
		className: "p-4",
		children: /* @__PURE__ */ jsx("form", {
			onSubmit: saveRegistration,
			noValidate: true,
			children: /* @__PURE__ */ jsxs(FieldSet, { children: [
				/* @__PURE__ */ jsx(FieldLegend, { children: "Informations personnelles" }),
				/* @__PURE__ */ jsx(FieldDescription, { children: "Donnez vos informations personnelles" }),
				/* @__PURE__ */ jsxs(FieldGroup, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs(Field, { children: [
							/* @__PURE__ */ jsx(FieldLabel, {
								htmlFor: "name",
								children: "Nom"
							}),
							/* @__PURE__ */ jsx(Input$1, {
								id: "name",
								name: "name",
								placeholder: "PINDER-WHITE",
								value: values.name,
								onBlur: validateField,
								onChange: (event) => updateField("name", event.target.value)
							}),
							/* @__PURE__ */ jsx(FieldError, { children: errors.name })
						] }), /* @__PURE__ */ jsxs(Field, { children: [
							/* @__PURE__ */ jsx(FieldLabel, {
								htmlFor: "prenom",
								children: "Prénom"
							}),
							/* @__PURE__ */ jsx(Input$1, {
								id: "prenom",
								name: "prenom",
								placeholder: "Maximilian",
								value: values.prenom,
								onBlur: validateField,
								onChange: (event) => updateField("prenom", event.target.value)
							}),
							/* @__PURE__ */ jsx(FieldError, { children: errors.prenom })
						] })]
					}),
					/* @__PURE__ */ jsxs(Field, { children: [
						/* @__PURE__ */ jsx(FieldLabel, {
							htmlFor: "email",
							children: "Email"
						}),
						/* @__PURE__ */ jsx(Input$1, {
							id: "email",
							name: "email",
							type: "email",
							placeholder: "max@ynov.com",
							value: values.email,
							onBlur: validateField,
							onChange: (event) => updateField("email", event.target.value)
						}),
						/* @__PURE__ */ jsx(FieldError, { children: errors.email })
					] }),
					/* @__PURE__ */ jsxs(Field, { children: [
						/* @__PURE__ */ jsx(FieldLabel, {
							htmlFor: "dateNaissance",
							children: "Date de naissance"
						}),
						/* @__PURE__ */ jsx(Calendar, {
							className: "max-w-[300px]",
							mode: "single",
							selected: new Date(values.dateNaissance),
							onSelect: updateField.bind(null, "dateNaissance"),
							captionLayout: "dropdown"
						}),
						/* @__PURE__ */ jsx(FieldError, { children: errors.dateNaissance })
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs(Field, { children: [
							/* @__PURE__ */ jsx(FieldLabel, {
								htmlFor: "ville",
								children: "Ville"
							}),
							/* @__PURE__ */ jsx(Input$1, {
								id: "ville",
								name: "ville",
								placeholder: "Paris",
								value: values.ville,
								onBlur: validateField,
								onChange: (event) => updateField("ville", event.target.value)
							}),
							/* @__PURE__ */ jsx(FieldError, { children: errors.ville })
						] }), /* @__PURE__ */ jsxs(Field, { children: [
							/* @__PURE__ */ jsx(FieldLabel, {
								htmlFor: "codePostal",
								children: "Code postal"
							}),
							/* @__PURE__ */ jsx(Input$1, {
								id: "codePostal",
								name: "codePostal",
								inputMode: "numeric",
								placeholder: "75001",
								value: values.codePostal,
								onBlur: validateField,
								onChange: (event) => updateField("codePostal", event.target.value)
							}),
							/* @__PURE__ */ jsx(FieldError, { children: errors.codePostal })
						] })]
					})
				] }),
				/* @__PURE__ */ jsx(Field, {
					orientation: "horizontal",
					children: /* @__PURE__ */ jsx(Button$1, {
						type: "submit",
						children: "Sauvegarder"
					})
				})
			] })
		})
	});
}
//#endregion
//#region src/components/Home.tsx
function Home() {
	return /* @__PURE__ */ jsxs("div", {
		className: "p-8 flex flex-col gap-4",
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: "text-4xl font-bold",
				children: "Welcome to TanStack Start"
			}),
			/* @__PURE__ */ jsx(CountButton, {}),
			/* @__PURE__ */ jsx(RegistrationForm, {})
		]
	});
}
var CountButton = () => {
	const [count, setCount] = useState(0);
	return /* @__PURE__ */ jsxs(Button$1, {
		onClick: () => setCount((c) => c + 1),
		className: "mt-4 w-[200px]",
		children: [
			"Clicked ",
			count,
			" times"
		]
	});
};
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var SplitComponent = Home;
//#endregion
export { SplitComponent as component };
