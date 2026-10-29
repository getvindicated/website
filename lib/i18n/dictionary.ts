import type { RichText } from "@/components/sections/shared/Rich";


type TitleBody = { title: string; body: string };

// Redesigned inner pages take their copy types straight from en.json, the
// base dictionary every locale merges onto (see get-dictionary.ts).
type EnJson = typeof import("./dictionaries/en.json");
export type AboutPageDict = EnJson["aboutPage"];
export type TeamPageDict = EnJson["teamPage"];
export type ResearchPageDict = EnJson["researchPage"];
export type InspectionPageDict = EnJson["inspectionPage"];
export type FraudPageDict = EnJson["fraudPage"];
export type DocumentsPageDict = EnJson["documentsPage"];
export type JoinPageDict = EnJson["joinPage"];
export type MapPageDict = EnJson["mapPage"];
export type MapMethodsDict = EnJson["mapMethods"];
export type EventsPageDict = EnJson["eventsPage"];
export type ApplyPageDict = EnJson["applyPage"];
export type NotFoundDict = EnJson["notFound"];
export type RightsPageDict = EnJson["rightsPage"];

// Copy for the redesigned home page (components/sections/home/*).
export type HomePageDict = {
	hero: {
		titleLead: string;
		// Rotating endings for the hero heading; the first one is also the
		// static text screen readers get.
		phrases: string[];
		body: string;
		ctaPrimary: string;
		ctaSecondary: string;
		photoAlt: string;
	};
	publicKnowledge: {
		title: string;
		// Rich text: plain strings plus { b } for the bold phrase.
		body: RichText;
		cta: string;
	};
	footing: {
		title: string;
		// Unruh Civil Rights Act excerpt shown under the heading.
		quote: string;
		quoteCite: string;
		body: string;
		rows: { stat: string; title: string; body: string; cite: string }[];
	};
	chapters: {
		title: string;
		body: string;
		items: { tag: string; title: string; body: string; cta: string; alt: string }[];
	};
	follow: {
		title: string;
		body: string;
		links: { platform: string; handle: string }[];
	};
	pillars: { title: string; body: string; items: TitleBody[] };
	free: {
		title: string;
		body: string;
		planTitle: string;
		price: string;
		checks: string[];
		offers: TitleBody[];
	};
	ppi: {
		title: string;
		// Rich text: plain strings plus { b } for the bold phrase.
		body: RichText;
		items: TitleBody[];
		primary: string;
		secondary: string;
	};
};

// The home page's title and description (the rest is homePage).
export type HomeDict = {
	meta: {
		title: string;
		description: string;
	};
};

// Keyed by the member's full name (matches `name` in lib/team.ts), not array
// position, so translations stay correct however that list changes. A name
// with no entry throws at render time (see app/[locale]/team/page.tsx).
export type TeamDict = { members: Record<string, TeamMemberDict> };

// major: degree program, shown under the position (left out for members
// whose only school info is their campus).
export type TeamMemberDict = { position: string; bio: string; major?: string };

export type RouteMetadataKey =
	| "home"
	| "about"
	| "team"
	| "inspection"
	| "fraud"
	| "documents"
	| "research"
	| "join"
	| "rights"
	| "contact"
	| "volunteer"
	| "map"
	| "mapMethods"
	| "events"
	| "apply";

export type RouteMetadataDict = {
	title: string;
	description: string;
	imageAlt: string;
};

export type SiteDictionary = {
	nav: Record<string, string>;
	ui: {
		openMenu: string;
		closeMenu: string;
		languageSwitcher: string;
		homeLabel: string;
	};
	notFound: NotFoundDict;
	footer: {
		about: string;
		rights: string;
		founded: string;
		columns: {
			organization: string;
			resources: string;
			connect: string;
		};
		links: {
			linkedIn: string;
			getInTouch: string;
			aboutUs: string;
			instagramUcla: string;
			instagramBerkeley: string;
			instagramUcsc: string;
		};
	};
	meta: {
		defaultTitle: string;
		defaultDescription: string;
		routes: Record<RouteMetadataKey, RouteMetadataDict>;
	};
	home: HomeDict;
	homePage: HomePageDict;
	aboutPage: AboutPageDict;
	teamPage: TeamPageDict;
	researchPage: ResearchPageDict;
	inspectionPage: InspectionPageDict;
	fraudPage: FraudPageDict;
	documentsPage: DocumentsPageDict;
	joinPage: JoinPageDict;
	mapPage: MapPageDict;
	mapMethods: MapMethodsDict;
	eventsPage: EventsPageDict;
	applyPage: ApplyPageDict;
	rightsPage: RightsPageDict;
	team: TeamDict;
};
