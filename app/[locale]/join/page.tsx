import Image from "next/image";
import {
	PageHero,
	FadeUp,
	SectionTitle,
	RoadDivider,
} from "@/components/ui";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/config";
import type { TeamDict } from "@/lib/i18n/dictionary";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	return getRouteMetadata(locale, "team", "/team");
}

type Social = {
	platform: "linkedin" | "github" | "instagram" | "website";
	href: string;
};

type Chapter = "leadership" | "ucla" | "berkeley" | "ucsc";

type TeamMember = {
	name: string;
	school: string;
	// Real uploaded photo path, or null if we don't have one yet
	// (renders an initials placeholder instead of a broken image).
	photo: string | null;
	chapter: Chapter;
	socials?: Social[];
	// English fallbacks, used if a dictionary entry is missing for this index
	position: string;
	bio: string;
};

// IMPORTANT: this array's order is the source of truth for dictionary
// translation lookups (dict.team.members[i] corresponds to team[i]).
// New members must be APPENDED at the end, never inserted in the middle,
// or every existing translated bio/position will shift and point at the
// wrong person. Chapter grouping for display happens separately below
// without reordering this array.
const team: TeamMember[] = [
	{
		name: "Rana Darwich",
		position: "Founder",
		school: "UCLA",
		photo: "/team/rana.jpg",
		chapter: "leadership",
		bio: "Rana founded VINdicated at 19 after a business law vocabulary word saved her from signing a predatory sales contract at a dealership. What started as a personal breaking point became a mission to dismantle the systems that exploit consumers who walk onto a car lot without backup. She leads VINdicated's research initiatives and strategic direction, driven by the belief that car knowledge should be public knowledge.",
	},
	{
		name: "Yinrui (Ray) Gan",
		position: "Technical Lead",
		school: "Computer Science & Linguistics, UCLA",
		photo: "/team/ray.jpg",
		chapter: "leadership",
		bio: "Ray Gan leads the data and AI pipeline for VINdicated's interactive dealership risk map. He designed the LLM-based classification system that turns unstructured consumer reviews into transparent, evidence-backed risk signals for car buyers. Ray studies Computer Science and Linguistics at UCLA.",
	},
	{
		name: "Halima Cherif Hminat",
		position: "Research & Outreach Lead",
		school: "Integrative Biology, UC Berkeley",
		photo: "/team/halima.jpg",
		chapter: "berkeley",
		bio: "Halima Cherif Hminat is an Integrative Biology student at UC Berkeley, minoring in Sustainable Business and Policy, and is on the pre-dental track. She is also a Research and Outreach Lead at VINdicated and contributes to creating resources that help people make informed decisions with confidence. She says VINdicated's mission is important because she wants to support women by helping them prevent unfair treatment in car buying and repairs.",
	},
	{
		name: "William Prawira",
		position: "Data Engineer",
		school: "Data Science & Applied Mathematics, UCLA",
		photo: "/team/william.jpg",
		chapter: "ucla",
		bio: "Will Prawira is a Data Science & Applied Mathematics double major at UCLA. At UCLA, he's currently involved in Bruin Sports Analytics as part of the Tennis Consulting team, as well as NSDC as a project lead. He is actively working on VINdicated as a data product engineer.",
	},
	{
		name: "Ameerah Zafar",
		position: "Data Engineer",
		school: "Chemical Engineering, UC Berkeley",
		photo: "/team/ameerah.jpg",
		chapter: "berkeley",
		bio: "Ameerah Zafar is a senior studying Chemical Engineering at UC Berkeley, she's also involved in Berkeley's Muslim Student Association and Undergraduate Research in coating mechanics. Ameerah contributes to data research and graphic design at VINdicated.",
	},
	{
		name: "Rizwaan Bana",
		position: "Software Engineer",
		school: "Computer Science, UCLA",
		photo: "/team/rizwaan.jpg",
		chapter: "leadership",
		bio: "Rizwaan Bana is a Computer Science major at UCLA. He is the Software Lead at VINdicated, where he builds tools to help consumers navigate the car-buying process without friction. Rizwaan is passionate about using technology to create positive change and making information more accessible for everyone.",
	},
	{
		name: "Peter Vincent Dickson",
		position: "Empirical & Data Lead",
		school: "Data Science & Economics, UC Berkeley",
		photo: "/team/peter.png",
		chapter: "berkeley",
		bio: "Peter Dickson is a Data Science and Economics student at the University of California, Berkeley, with a strong focus on data analytics, financial modeling, and real-world problem solving. He brings a combination of technical rigor and business insight, leveraging tools such as Python, SQL, and statistical modeling to extract meaningful insights from complex datasets. Driven by curiosity and a results-oriented mindset, Peter is passionate about using data to uncover inefficiencies, identify opportunities, and create measurable value.",
	},
	{
		name: "Evanceline Tang",
		position: "Visual Design Lead",
		school: "Biology, UCLA",
		photo: "/team/evanceline.jpg",
		chapter: "leadership",
		bio: "Evanceline is a second year biology major at UCLA. She is passionate about using art and design as a mean of conveying messages. Through her art, she hopes to help people understand more about VINdicated and the existing inequalities and dangers in the automotive industry.",
	},
	{
		name: "Brisa Gómez",
		position: "Data Analyst",
		school: "Psychology",
		// Chapter not specified in original source data -- placeholder guess,
		// confirm which chapter Brisa actually belongs to.
		photo: "/team/brisa.png",
		chapter: "ucla",
		bio: "Brisa Gómez is a first-year transfer psychology student. Raised in Tijuana, México, they are passionate about research related to underrepresented communities such as women, people with disabilities, and queer identities. They hope to become a behavioral therapist in the future. In their free time, they like to read cheesy romance novels and do creative writing.",
	},
	{
		name: "Fiona Wangsawidjaja",
		position: "Research Analyst",
		school: "UCLA",
		photo: "/team/fiona.jpg",
		chapter: "ucla",
		bio: "Fiona Wangsawidjaja is a current undergraduate student at UCLA. She helps out with the data section of VINdicated!",
	},
	{
		name: "Ayat Ashraf",
		position: "Research Analyst",
		school: "Math/Econ, UCLA",
		photo: "/team/ayat.png",
		chapter: "ucla",
		bio: "Ayat Ashraf is a Math/Econ major at UCLA interested in economic policymaking. She does research at VINdicated, so she can hopefully buy a car without calling her dad 8,000 times in the future.",
	},
	{
		name: "Paul Ha",
		position: "Research Analyst",
		school: "Integrative Biology, UC Berkeley",
		photo: "/team/paul.png",
		chapter: "berkeley",
		bio: "Paul is a first-year student at UC Berkeley planning to major in Integrative Biology on a pre-dental track. He is excited to contribute to making reliable information more accessible and supporting people who may face unfair practices in the auto industry.",
	},
	{
		name: "Bryan Zhang",
		position: "Software Engineer",
		school: "Computer Science, UCLA",
		photo: "/team/bryan.png",
		chapter: "ucla",
		bio: "Bryan Zhang is a CS major at UCLA. In his free time he enjoys playing basketball, volleyball, and baking. He is a developer for VINdicated.",
	},
	{
		name: "Jas Wang",
		position: "Software Engineer",
		school: "Political Science & Geography, UCLA",
		photo: "/team/jas.jpg",
		chapter: "ucla",
		bio: "Jas Wang is a 4th year at UCLA majoring in Political Science and Geography. Using GIS mapping skills, he helps VINdicated's data to be approachable when visualized. VINdicated is important to him because growing up in an immigrant community, he knows how immigrants are vulnerable too and are unfairly scammed.",
	},
	// -- UCSC chapter, appended below. New additions always go at the end. --
	{
		name: "Gundeep Sambee",
		position: "Outreach Lead",
		school: "Cognitive Science, UC Santa Cruz",
		photo: "/team/gundeep.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/gundeep-k-sambee/" }],
		bio: "Gundeep is a Cognitive Science student at UC Santa Cruz, minoring in Technology and Information Management. She's interested in the intersection of people and technology, especially how AI, design, and psychology shape the way we make decisions. Outside class, she's involved in research and enjoys opportunities to learn more about human behavior and cognition, and likes taking on leadership roles that build community and create meaningful experiences for others.",
	},
	{
		name: "Ujjwal Nigam",
		position: "Research Analyst",
		school: "Economics, UC Santa Cruz",
		photo: "/team/ujjwal.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/ujjwal-nigam/" }],
		bio: "Ujjwal is an Economics major interested in using statistical tools to solve economic and policy problems. He hopes to eventually work with a think tank or government agency as a policy analyst, turning advocacy into action. He has used QGIS, Python, R, and STATA to analyze the effectiveness of legislation and public policy, and brings that experience to VINdicated's mission of protecting consumers in automobile sales. His research interests include behavioral economics, health policy, antitrust, and public finance.",
	},
	{
		name: "Nickolas Vela",
		position: "Software Engineer",
		school: "Computer Science, UC Santa Cruz",
		photo: "/team/nickolas.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/nickvela" }],
		bio: "Nick studies Computer Science at UC Santa Cruz and spends most of his time building projects, lifting weights, climbing rocks, and indulging in nerdy interests. He's a member of the Tech4Good Research Lab and has previously done geospatial work for the Overture Maps Foundation through UCSC's Project Terraforma. He's also a Resident Advisor at UCSC. Mostly, he likes making stuff, figuring out how things work, and developing software that helps people.",
	},
	{
		name: "Adhya Maddukuri",
		position: "Software Engineer",
		school: "Technology & Information Management, UC Santa Cruz",
		photo: "/team/adhya.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/adhya-maddukuri-82a88a339" }],
		bio: "Adhya is a Technology and Information Management student at UC Santa Cruz with a passion for building technology that creates real-world impact, spanning software development, AI, data analytics, and product strategy. She's conducted undergraduate research in generative AI, consulted with nonprofits through 180 Degrees Consulting, and helped organize hackathons with NVIDIA and ASUS. She's currently a Software Development Engineering Intern at Heron Power, building software systems and strengthening her technical and problem-solving skills.",
	},
	{
		name: "Vanessa Phan",
		position: "Research Analyst",
		school: "Computer Engineering, UC Santa Cruz",
		photo: "/team/vanessa.jpg",
		chapter: "ucsc",
		socials: [
			{ platform: "linkedin", href: "https://www.linkedin.com/in/vanessaphan06" },
			{ platform: "github", href: "https://github.com/vqnnie" },
		],
		bio: "Vanessa is pursuing a degree in Computer Engineering with a concentration in Computer Systems, interested in the combination of software and electrical engineering, especially robotics and intelligent technologies. She's the Treasurer for the Society of Women Engineers at UC Santa Cruz, where she's secured more than $5,000 in funding this year, and has been involved in SlothLab as a developer. She wants to get more involved in research, digging into topics in detail and applying what she learns to build solutions.",
	},
];

// Rendering order for the flat team list below -- intentionally NOT
// grouped/sorted by chapter. Leadership (indices 0, 5, 1, 7 in the `team`
// array above) is placed near the top; everyone else is interspersed.
// These are indices into the `team` array, not chapters, so translations
// (which are indexed to `team`'s original order) still line up correctly
// regardless of this display order.
const DISPLAY_ORDER: number[] = [
	0, 5, 1, 7, 3, 14, 2, 9, 16, 4, 12, 15, 6, 10, 17, 11, 13, 18, 8,
];
const CHAPTER_LABEL: Record<Chapter, string> = {
	leadership: "Leadership",
	ucla: "UCLA Chapter",
	berkeley: "UC Berkeley Chapter",
	ucsc: "UC Santa Cruz Chapter",
};
// Leadership has no single school mascot (it's cross-chapter), so no image.
const CHAPTER_MASCOT: Partial<Record<Chapter, string>> = {
	ucla: "/ucla-mascot.png",
	berkeley: "/berkeley-mascot.png",
	ucsc: "/ucsc-mascot.png",
};

function Initials({ name }: { name: string }) {
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
	return (
		<div
			className="absolute inset-0 flex items-center justify-center"
			style={{
				border: "1px solid var(--color-border)",
				background: "var(--color-bg-surface)",
			}}
		>
			<span
				className="text-[clamp(2rem,4vw,3.2rem)] font-bold"
				style={{ color: "var(--color-light)" }}
			>
				{initials}
			</span>
		</div>
	);
}

function SocialIcon({ platform }: { platform: Social["platform"] }) {
	const size = 18;
	switch (platform) {
		case "linkedin":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
				</svg>
			);
		case "github":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
				</svg>
			);
		case "instagram":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
				</svg>
			);
		case "website":
			return (
				<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
				</svg>
			);
	}
}

export default async function TeamPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const dict = (await getDictionary(locale as Locale)) as { team?: TeamDict };
	const d = dict.team ?? {};
	const members = d.members;

	return (
		<>
			<PageHero
				kicker=""
				title={
					<>
						{d.hero?.titleLine1 ?? "Driven by the"}
						<br />
						<em>{d.hero?.titleEm ?? "same frustration."}</em>
					</>
				}
			/>

			<section className="px-20 py-24 max-md:px-6 max-md:py-16">
				<SectionTitle className="mb-16">
					{d.sectionTitle ?? "Meet the Team"}
				</SectionTitle>

				<div className="space-y-0">
					{DISPLAY_ORDER.map((dictI, i) => {
						const member = team[dictI];
						const position = members?.[dictI]?.position ?? member.position;
						const bio = members?.[dictI]?.bio ?? member.bio;
						const mascot = CHAPTER_MASCOT[member.chapter];
						return (
							<FadeUp key={member.name}>
								<div className="grid grid-cols-[280px_1fr_auto] gap-10 items-center py-12 max-lg:grid-cols-1 max-lg:gap-6 max-lg:py-8 max-lg:text-center max-lg:justify-items-center">
									{/* Photo + chapter logo, side by side */}
									<div className="flex items-center gap-4 max-lg:flex-col">
										<div
											className="relative w-full max-lg:w-52"
											style={{ aspectRatio: "1 / 1" }}
										>
											{member.photo ? (
												<div
													className="absolute inset-0 overflow-hidden"
													style={{
														border: "1px solid var(--color-border)",
														background: "var(--color-bg-surface)",
													}}
												>
													<Image
														src={member.photo}
														alt={member.name}
														fill
														className="object-cover"
														sizes="(max-width: 1024px) 208px, 280px"
													/>
												</div>
											) : (
												<Initials name={member.name} />
											)}
										</div>
										{mascot && (
											<Image
												src={mascot}
												alt=""
												width={72}
												height={72}
												title={CHAPTER_LABEL[member.chapter]}
												className="h-16 w-auto object-contain flex-shrink-0"
											/>
										)}
									</div>

									{/* Info */}
									<div>
										<h3 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] tracking-[-0.01em] mb-2">
											{member.name}
										</h3>
										<p
											className="text-[1.15rem] font-bold mb-1"
											style={{ color: "var(--color-accent)" }}
										>
											{position}
										</p>
										<p
											className="text-[1.15rem] font-bold mb-5 text-white"
											style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
										>
											{member.school}
										</p>
										<p className="text-[0.95rem] text-white leading-[1.75] max-w-140">
											{bio}
										</p>
									</div>

									{/* Socials */}
									{member.socials && member.socials.length > 0 && (
										<div className="flex flex-col gap-3 max-lg:flex-row max-lg:mt-2">
											{member.socials.map((s) => (
												<a
													key={s.platform}
													href={s.href}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center justify-center w-10 h-10 transition-colors duration-200 hover:scale-110"
													style={{
														border: "1px solid var(--color-border)",
														background: "var(--color-bg-surface)",
														color: "var(--color-light)",
													}}
													aria-label={`${member.name} on ${s.platform}`}
												>
													<SocialIcon platform={s.platform} />
												</a>
											))}
										</div>
									)}
								</div>

								{i < DISPLAY_ORDER.length - 1 && <RoadDivider />}
							</FadeUp>
						);
					})}
				</div>
			</section>

			<RoadDivider />

			<FadeUp>
				<section
					className="px-20 py-24 max-md:px-6 max-md:py-16 text-center"
					style={{ background: "var(--color-bg-page)" }}
				>
					<h2 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] mb-6">
						{d.cta?.headingPlain ?? "Want to be part of"}{" "}
						<em>{d.cta?.headingEm ?? "this?"}</em>
					</h2>
					<p className="text-[1.05rem] text-white leading-[1.7] max-w-[540px] mx-auto">
						{d.cta?.body ??
							"VINdicated is always looking for passionate people: researchers, developers, designers, educators, and advocates. If you believe car buying should be fair for everyone, we want to hear from you."}
					</p>
					<a
						href="/join"
						className="inline-block mt-10 px-8 py-[0.9rem] text-[0.85rem] font-semibold tracking-wide no-underline transition-all duration-200 text-white hover:-translate-y-0.5"
						style={{ background: "var(--color-vivid)" }}
					>
						{d.cta?.button ?? "Get in Touch"}
					</a>
				</section>
			</FadeUp>
		</>
	);
}
