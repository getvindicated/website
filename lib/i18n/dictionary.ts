import type { RichText } from "@/components/sections/shared/Rich";

export type HomeDict = {
	hero: {
		titleLine1: string;
		titleLine2: string;
		titleEm: string;
		subtitle: string;
		ctaPrimary: string;
		ctaSecondary: string;
		stats: { label: string; cite: string }[];
	};
	cards: {
		titlePrefix: string;
		titleEm: string;
		pillars: { kicker: string; title: string; body: string; label: string }[];
	};
	quote: {
		text: string;
		cite: string;
		source: string;
	};
	founder: {
		titleLine1: string;
		titleEm: string;
		body1: string;
		body2Prefix: string;
		body2Bold: string;
		cta: string;
	};
	meta: {
		title: string;
		description: string;
	};
};

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
	sources: { heading: string; items: string[] };
	publicKnowledge: {
		title: string;
		// Rich text: plain strings plus { b } for the bold phrase.
		body: RichText;
		ctaPrimary: string;
		ctaSecondary: string;
		phoneLabel: string;
		clock: string;
		appName: string;
		notifs: { time: string; body: string }[];
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
	cta: { title: string; body: string; primary: string; secondary: string };
};

export type AboutTextSegment = { text: string; bold?: boolean };

export type AboutDict = {
	hero: {
		titlePlain: string;
		titleEm: string;
		subtitle: string;
	};
	whyWeExist: {
		titleLine1: string;
		titleEm: string;
		titleLine2: string;
		para1: AboutTextSegment[];
		para2: AboutTextSegment[];
		para3: AboutTextSegment[];
		para4: string;
	};
	mission: {
		heading: string;
		headingEm: string;
		subheading: string;
		pillars: { word: string; body: string }[];
	};
	story: {
		titleEm: string;
		subtitle: string;
		strikes: { num: string; label: string; body: string[] }[];
		pullquote: { quote: string; attribution: string };
		bio: { label: string; body: string; closingLine: string };
		wollstonecraft: { label: string; quote: string };
	};
	provide: {
		titlePlain: string;
		titleEm: string;
		subtitle: string;
		items: { cat: string; title: string; body: string }[];
	};
};

export type TeamMemberDict = { position: string; bio: string };

export type TeamDict = {
	hero: { titleLine1: string; titleEm: string };
	sectionTitle: string;
	// Keyed by the member's full name (matches `name` in the `team` array in
	// app/[locale]/team/page.tsx), not array position -- so translations stay
	// correct no matter how that array is reordered, trimmed, or added to.
	// A name with no entry here throws at render time (see the lookup in
	// that file) instead of silently rendering a blank bio.
	members: Record<string, TeamMemberDict>;
	cta: {
		headingPlain: string;
		headingEm: string;
		body: string;
		button: string;
	};
};

export type RouteMetadataKey =
	| "home"
	| "about"
	| "team"
	| "inspection"
	| "fraud"
	| "documents"
	| "research"
	| "rights"
	| "contact"
	| "volunteer"
	| "map"
	| "mapMethods";

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
		expandSection: string;
		languageSwitcher: string;
		homeLabel: string;
	};
	footer: {
		tagline: string;
		subtagline: string;
		copyright: string;
		mission: string;
		about: string;
		rights: string;
		founded: string;
		columns: {
			organization: string;
			navigate: string;
			resources: string;
			connect: string;
		};
		links: {
			linkedIn: string;
			instagram: string;
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
	about: AboutDict;
	team: TeamDict;
};
