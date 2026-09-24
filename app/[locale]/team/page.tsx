import {
	PageHero,
	FadeUp,
	SectionTitle,
	Button,
} from "@/components/ui";
import {
	TeamDirectory,
	type Chapter,
	type Social,
	type TeamMemberView,
} from "@/components/sections/TeamDirectory";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { positionRank } from "@/lib/team-rank";
import type { Locale } from "@/lib/i18n/config";

// Solid background color for this page. Matches the purple already used
// for --color-accent elsewhere in the design (rgba(149,51,165,...)).
const PAGE_BG = "#1A0821";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	return getRouteMetadata(locale, "team", "/team");
}

type TeamMember = {
	name: string;
	// Major/degree program, shown under the member's position. Omitted for
	// members whose only "school" info was their campus (already conveyed
	// by `chapter`).
	major?: string;
	// Real uploaded photo path, or null if we don't have one yet
	// (renders an initials placeholder instead of a broken image).
	photo: string | null;
	chapter: Chapter;
	socials?: Social[];
	// Off the current roster: kept (not deleted) so bios/photos aren't lost,
	// but excluded from the rendered directory.
	hidden?: true;
};

// Order here is the actual rendering order -- deliberately mixed round-robin
// across leadership/UCLA/Berkeley/UCSC so no chapter clusters together.
// Hidden members (off the current roster) are appended
// at the end and excluded from `resolved` below. Translations are looked up
// by `name` (see `resolved` below), not by position in this array, so
// reordering, inserting, or removing members here never desyncs dict.team.members
// in the locale files.
const team: TeamMember[] = [
	{
		name: "Rana Darwich",
		photo: "/team/rana.png",
		chapter: "leadership",
	},
	{
		name: "Fiona Wangsawidjaja",
		major: "Statistics & Data Science",
		photo: "/team/fiona.jpg",
		chapter: "ucla",
	},
	{
		name: "Ashwin Vinod",
		major: "Computer Science",
		photo: "/team/ashwin.jpg",
		chapter: "ucsc",
		socials: [{ platform: "website", href: "https://aiea-lab.github.io" }],
	},
	{
		name: "Rizwaan Bana",
		photo: "/team/rizwaan.jpg",
		chapter: "leadership",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/rizwaanbana/" }],
	},
	{
		name: "William Prawira",
		major: "Data Science & Applied Mathematics",
		photo: "/team/william.jpg",
		chapter: "ucla",
	},
	{
		name: "Ayat Ashraf",
		major: "Math/Econ",
		photo: "/team/ayat.png",
		chapter: "ucla",
	},
	{
		name: "Noirit Ghosh Choudhuri",
		major: "Computer Science",
		photo: "/team/noirit.jpg",
		chapter: "ucb",
	},
	{
		name: "Halima Cherif Hminat",
		major: "Integrative Biology",
		photo: "/team/halima.jpg",
		chapter: "ucb",
	},
	{
		name: "Gundeep Sambee",
		major: "Cognitive Science",
		photo: "/team/gundeep.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/gundeep-k-sambee/" }],
	},
	{
		name: "Adhya Maddukuri",
		major: "Technology & Information Management",
		photo: "/team/adhya.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/adhya-maddukuri-82a88a339" }],
	},
	{
		name: "Fernando Cedillo-Hernandez",
		major: "Biology & Political Science",
		photo: "/team/fernando.png",
		chapter: "ucla",
	},
	{
		name: "Yinrui (Ray) Gan",
		major: "Computer Science & Linguistics",
		photo: "/team/ray.jpg",
		chapter: "ucla",
	},
	{
		name: "Evanceline Tang",
		major: "Biology",
		photo: "/team/evanceline.jpg",
		chapter: "ucla",
	},
	{
		name: "Rouqaya Elbanna",
		photo: "/team/rouqaya.png",
		chapter: "ucla",
	},
	{
		name: "Daryen Romero",
		major: "Computer Science",
		photo: "/team/daryen.jpg",
		chapter: "ucb",
	},
	{
		name: "Vanessa Phan",
		major: "Computer Engineering",
		photo: "/team/vanessa.jpg",
		chapter: "ucsc",
		socials: [
			{ platform: "linkedin", href: "https://www.linkedin.com/in/vanessaphan06" },
			{ platform: "github", href: "https://github.com/vqnnie" },
		],
	},
	{
		name: "Brisa Gómez",
		major: "Psychology",
		photo: "/team/brisa.png",
		chapter: "ucla",
	},
	{
		name: "Pierce Kosobayashi",
		major: "Media Studies & Education",
		photo: "/team/pierce.jpg",
		chapter: "ucb",
	},
	{
		name: "Chino Sawatyanont",
		major: "Electrical & Computer Engineering",
		photo: "/team/chino.png",
		chapter: "ucb",
	},
	{
		name: "William Guo",
		major: "Computer Science",
		photo: "/team/williamguo.png",
		chapter: "ucsc",
	},
	{
		name: "Daniel",
		major: "Applied Mathematics",
		photo: "/team/daniel.png",
		chapter: "ucb",
	},
	{
		name: "Chloe Lin",
		major: "Integrative Biology",
		photo: "/team/chloe.png",
		chapter: "ucb",
	},
	{
		name: "Ian de la Houssaye",
		major: "Mechanical Engineering",
		photo: "/team/ian.jpg",
		chapter: "ucb",
	},
	{
		name: "James Cheng",
		major: "Data Science & Cognitive Science",
		photo: "/team/james.png",
		chapter: "ucb",
	},
	{
		name: "Bryan Zhang",
		major: "Computer Science",
		photo: "/team/bryan.png",
		chapter: "ucla",
	},
	{
		name: "Rahul Puritipati",
		major: "Computer Science",
		photo: "/team/rahul.jpg",
		chapter: "ucla",
	},
	// {
	// 	name: "Ujjwal Nigam",
	// 	position: "Research Analyst",
	// 	major: "Economics",
	// 	photo: "/team/ujjwal.jpg",
	// 	chapter: "ucsc",
	// 	socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/ujjwal-nigam/" }],
	// 	bio: "Ujjwal is an Economics major interested in using statistical tools to solve economic and policy problems. He hopes to eventually work with a think tank or government agency as a policy analyst, turning advocacy into action. He has used QGIS, Python, R, and STATA to analyze the effectiveness of legislation and public policy, and brings that experience to VINdicated's mission of protecting consumers in automobile sales. His research interests include behavioral economics, health policy, antitrust, and public finance.",
	// 	hidden: true,
	// },
	// {
	// 	name: "Nickolas Vela",
	// 	position: "Software Engineer",
	// 	major: "Computer Science",
	// 	photo: "/team/nickolas.jpg",
	// 	chapter: "ucsc",
	// 	socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/nickvela" }],
	// 	bio: "Nick studies Computer Science at UC Santa Cruz and spends most of his time building projects, lifting weights, climbing rocks, and indulging in nerdy interests. He's a member of the Tech4Good Research Lab and has previously done geospatial work for the Overture Maps Foundation through UCSC's Project Terraforma. He's also a Resident Advisor at UCSC. Mostly, he likes making stuff, figuring out how things work, and developing software that helps people.",
	// 	hidden: true,
	// },
];

export default async function TeamPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const dict = await getDictionary(locale as Locale);
	const d = dict.team;
	// Rank is always computed from the English position, regardless of
	// the page's locale, so member ordering never depends on how a
	// translation happens to word someone's title (see positionRank).
	const enMembers = (await getDictionary("en" as Locale)).team.members;

	const resolved: TeamMemberView[] = team
		.filter((member) => !member.hidden)
		.map((member) => {
			const entry = d.members[member.name];
			if (!entry) {
				throw new Error(
					`Missing team dict entry for "${member.name}" -- add one to lib/i18n/dictionaries/en.json under team.members before adding them to the roster.`,
				);
			}
			const enPosition = enMembers[member.name]?.position ?? entry.position;
			return {
				name: member.name,
				position: entry.position,
				bio: entry.bio,
				rank: positionRank(enPosition),
				major: member.major,
				chapter: member.chapter,
				photo: member.photo,
				socials: member.socials,
			};
		});

	return (
		<div style={{ background: PAGE_BG }}>
			<PageHero
				kicker=""
				contained
				title={
					<>
						{d.hero.titleLine1}
						<br />
						<em>{d.hero.titleEm}</em>
					</>
				}
				titleStyle={
					{ fontSize: "clamp(2.6rem,4.2vw,4.6rem)" } as React.CSSProperties
				}
			/>

			<section className="px-20 py-24 max-md:px-6 max-md:py-16">
				<div className="max-w-[1400px] mx-auto">
					<SectionTitle className="mb-16">{d.sectionTitle}</SectionTitle>

					<TeamDirectory members={resolved} />
				</div>
			</section>

			<FadeUp>
				<section
					className="px-20 py-24 max-md:px-6 max-md:py-16 text-center"
					style={{ background: PAGE_BG }}
				>
					<div className="max-w-[1400px] mx-auto">
						<h2 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] mb-6">
							{d.cta.headingPlain} <em>{d.cta.headingEm}</em>
						</h2>
						<p className="text-[1.05rem] text-white leading-[1.7] max-w-[540px] mx-auto">
							{d.cta.body}
						</p>
						<Button href="/join" className="mt-10">
							{d.cta.button}
						</Button>
					</div>
				</section>
			</FadeUp>
		</div>
	);
}
