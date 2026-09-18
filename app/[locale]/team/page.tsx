import {
	PageHero,
	FadeUp,
	SectionTitle,
	Button,
} from "@/components/ui";
import {
	TeamDirectory,
	type Chapter,
	type Campus,
	type Social,
	type TeamMemberView,
} from "@/components/sections/TeamDirectory";
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

type TeamMember = {
	name: string;
	school: string;
	// Real uploaded photo path, or null if we don't have one yet
	// (renders an initials placeholder instead of a broken image).
	photo: string | null;
	chapter: Chapter;
	// Campus used for the team page's school filter. Independent of
	// `chapter`: leadership members are grouped under "leadership" for
	// display, but still belong to a real campus for filtering purposes.
	campus: Campus;
	socials?: Social[];
	// English fallbacks, used if a dictionary entry is missing for this index
	position: string;
	bio: string;
	// Off the current roster: kept (not deleted) so bios/photos aren't lost,
	// but excluded from the rendered directory.
	hidden?: true;
};

// Order here is the actual rendering order -- deliberately mixed round-robin
// across leadership/UCLA/Berkeley/UCSC so no group (including leadership)
// clusters together. Hidden members (off the current roster) are appended
// at the end and excluded from `resolved` below. Translations are looked up
// by `name` (see `resolved` below), not by position in this array, so
// reordering, inserting, or removing members here never desyncs dict.team.members
// in the locale files.
const team: TeamMember[] = [
	{
		name: "Rana Darwich",
		position: "Founder & President",
		school: "UC Berkeley",
		photo: "/team/rana.jpg",
		chapter: "leadership",
		campus: "ucb",
		bio: "Rana founded VINdicated at 19 after a business law vocabulary word saved her from signing a predatory sales contract at a dealership. What started as a personal breaking point became a mission to dismantle the systems that exploit consumers who walk onto a car lot without backup. She leads VINdicated's research initiatives and strategic direction, driven by the belief that car knowledge should be public knowledge.",
	},
	{
		name: "Rizwaan Bana",
		position: "Chapter Director",
		school: "UCLA",
		photo: "/team/rizwaan.jpg",
		chapter: "leadership",
		campus: "ucla",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/rizwaanbana/" }],
		bio: "Rizwaan Bana is a Computer Science major at UCLA. He is the Software Lead at VINdicated, where he builds tools to help consumers navigate the car-buying process without friction. Rizwaan is passionate about using technology to create positive change and making information more accessible for everyone.",
	},
	{
		name: "Fiona Wangsawidjaja",
		position: "President",
		school: "UCLA",
		photo: "/team/fiona.jpg",
		chapter: "ucla",
		campus: "ucla",
		bio: "Fiona Wangsawidjaja is a current undergraduate student at UCLA. She helps out with the data section of VINdicated!",
	},
	{
		name: "Ashwin Vinod",
		position: "President",
		school: "UCSC",
		photo: "/team/ashwin.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		bio: "Ashwin Vinod is a Computer Science major at UCSC. He is the President of the VINdicated chapter at UCSC. Through involvement in various research labs and software engineering experiences, Ashwin has built a technical foundation that he wants to use to push computational research that benefits the community, and provide educational opportunities for his community. Ashwin previously interned at IBM as a Software Developer Intern, and is continuing his interest in research as part of the AIEA Lab @ UCSC, focused on explainable artificial intelligence.",
	},
	{
		name: "William Prawira",
		position: "Internal Vice President",
		school: "Data Science & Applied Mathematics, UCLA",
		photo: "/team/william.jpg",
		chapter: "ucla",
		campus: "ucla",
		bio: "Will Prawira is a Data Science & Applied Mathematics double major at UCLA. At UCLA, he's currently involved in Bruin Sports Analytics as part of the Tennis Consulting team, as well as NSDC as a project lead. He is actively working on VINdicated as a data product engineer.",
	},
	{
		name: "Ayat Ashraf",
		position: "External Vice President",
		school: "Math/Econ, UCLA",
		photo: "/team/ayat.png",
		chapter: "ucla",
		campus: "ucla",
		bio: "Ayat Ashraf is a Math/Econ major at UCLA interested in economic policymaking. She does research at VINdicated, so she can hopefully buy a car without calling her dad 8,000 times in the future.",
	},
	{
		name: "Noirit Ghosh Choudhuri",
		position: "Internal Vice President",
		school: "Computer Science, UC Berkeley",
		photo: "/team/noirit.png",
		chapter: "berkeley",
		campus: "ucb",
		bio: "Noirit Ghosh Choudhuri is a Computer Science major at UC Berkeley. He is the Internal Vice President of the VINdicated chapter at UC Berkeley. Through his experience developing multiple real world projects, Noirit has built strong technical and collaborative skills that he wants to use to build more solutions to pressing societal issues, such as the one VINdicated stands to fight.",
	},
	{
		name: "Adhya Maddukuri",
		position: "Vice President",
		school: "Technology & Information Management, UC Santa Cruz",
		photo: "/team/adhya.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/adhya-maddukuri-82a88a339" }],
		bio: "Adhya is a Technology and Information Management student at UC Santa Cruz with a passion for building technology that creates real-world impact, spanning software development, AI, data analytics, and product strategy. She's conducted undergraduate research in generative AI, consulted with nonprofits through 180 Degrees Consulting, and helped organize hackathons with NVIDIA and ASUS. She's currently a Software Development Engineering Intern at Heron Power, building software systems and strengthening her technical and problem-solving skills.",
	},
	{
		name: "Halima Cherif Hminat",
		position: "Outreach Lead",
		school: "Integrative Biology, UC Berkeley",
		photo: "/team/halima.jpg",
		chapter: "berkeley",
		campus: "ucb",
		bio: "Halima Cherif Hminat is an Integrative Biology student at UC Berkeley, minoring in Sustainable Business and Policy, and is on the pre-dental track. She is also the Outreach Lead at VINdicated and contributes to creating resources that help people make informed decisions with confidence. She says VINdicated's mission is important because she wants to support women by helping them prevent unfair treatment in car buying and repairs.",
	},
	{
		name: "Gundeep Sambee",
		position: "Outreach Lead",
		school: "Cognitive Science, UC Santa Cruz",
		photo: "/team/gundeep.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/gundeep-k-sambee/" }],
		bio: "Gundeep is a Cognitive Science student at UC Santa Cruz, minoring in Technology and Information Management. She's interested in the intersection of people and technology, especially how AI, design, and psychology shape the way we make decisions. Outside class, she's involved in research and enjoys opportunities to learn more about human behavior and cognition, and likes taking on leadership roles that build community and create meaningful experiences for others.",
	},
	{
    name: "Fernando Cedillo-Hernandez",
    position: "Research Lead",
    school: "Biology & Political Science, UCLA",
    photo: "/team/fernando.png",
    chapter: "ucla",
    campus: "ucla",
    bio: "Fernando Cedillo-Hernandez is a Biology and Political Science double major at UCLA, with minors in Biomedical Research and Community Engagement and Social Change. He brings a background in research and civic advocacy to his role as Research Lead at VINdicated, driven by a commitment to expanding equitable access and protection for underserved communities. Outside VINdicated, Fernando is involved in leadership and community engagement work across UCLA, including advocacy for immigrant and working-class students.",
},
	{
		name: "Yinrui (Ray) Gan",
		position: "Data Lead",
		school: "Computer Science & Linguistics, UCLA",
		photo: "/team/ray.jpg",
		chapter: "ucla",
		campus: "ucla",
		bio: "Ray Gan leads the data and AI pipeline for VINdicated's interactive dealership risk map. He designed the LLM-based classification system that turns unstructured consumer reviews into transparent, evidence-backed risk signals for car buyers. Ray studies Computer Science and Linguistics at UCLA.",
	},
	{
		name: "Evanceline Tang",
		position: "Design Lead & Outreach Lead",
		school: "Biology, UCLA",
		photo: "/team/evanceline.jpg",
		chapter: "ucla",
		campus: "ucla",
		bio: "Evanceline is a second year biology major at UCLA. She is passionate about using art and design as a mean of conveying messages. Through her art, she hopes to help people understand more about VINdicated and the existing inequalities and dangers in the automotive industry.",
	},
	{
		name: "Will",
		position: "Data Analytics Lead",
		school: "N/A",
		photo: null,
		chapter: "ucsc",
		campus: "ucsc",
		bio: "N/A",
	},
	{
		name: "Rouqaya Elbanna",
		position: "Fountain Valley HS Lead",
		school: "N/A",
		photo: "/team/rouqaya.png",
		chapter: "ucla",
		campus: "ucla",
		bio: "N/A",
	},
	{
		name: "Daryen Romero",
		position: "Technical Writing Lead",
		school: "Computer Science, UC Berkeley",
		photo: "/team/daryen.jpg",
		chapter: "berkeley",
		campus: "ucb",
		bio: "Daryen Romero is a Computer Science student at UC Berkeley. Joining VINdicated is important to him because he wants to help others be informed about the importance of buying a car and not be afraid. He also wants to speak out and help others understand how people can be taken advantage of if they are a woman or a different race.",
	},
	{
		name: "Vanessa Phan",
		position: "Data Analytics Lead",
		school: "Computer Engineering, UC Santa Cruz",
		photo: "/team/vanessa.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		socials: [
			{ platform: "linkedin", href: "https://www.linkedin.com/in/vanessaphan06" },
			{ platform: "github", href: "https://github.com/vqnnie" },
		],
		bio: "Vanessa is pursuing a degree in Computer Engineering with a concentration in Computer Systems, interested in the combination of software and electrical engineering, especially robotics and intelligent technologies. She's the Treasurer for the Society of Women Engineers at UC Santa Cruz, where she's secured more than $5,000 in funding this year, and has been involved in SlothLab as a developer. She wants to get more involved in research, digging into topics in detail and applying what she learns to build solutions.",
	},
	{
		name: "Brisa Gómez",
		position: "Technical Writing Lead",
		school: "Psychology, UCLA",
		photo: "/team/brisa.png",
		chapter: "ucla",
		campus: "ucla",
		bio: "Brisa Gómez is a first-year transfer psychology student. Raised in Tijuana, México, they are passionate about research related to underrepresented communities such as women, people with disabilities, and queer identities. They hope to become a behavioral therapist in the future. In their free time, they like to read cheesy romance novels and do creative writing.",
	},
	{
		name: "Ujjwal Nigam",
		position: "Research Analyst",
		school: "Economics, UC Santa Cruz",
		photo: "/team/ujjwal.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/ujjwal-nigam/" }],
		bio: "Ujjwal is an Economics major interested in using statistical tools to solve economic and policy problems. He hopes to eventually work with a think tank or government agency as a policy analyst, turning advocacy into action. He has used QGIS, Python, R, and STATA to analyze the effectiveness of legislation and public policy, and brings that experience to VINdicated's mission of protecting consumers in automobile sales. His research interests include behavioral economics, health policy, antitrust, and public finance.",
		hidden: true,
	},
	{
		name: "Nickolas Vela",
		position: "Software Engineer",
		school: "Computer Science, UC Santa Cruz",
		photo: "/team/nickolas.jpg",
		chapter: "ucsc",
		campus: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/nickvela" }],
		bio: "Nick studies Computer Science at UC Santa Cruz and spends most of his time building projects, lifting weights, climbing rocks, and indulging in nerdy interests. He's a member of the Tech4Good Research Lab and has previously done geospatial work for the Overture Maps Foundation through UCSC's Project Terraforma. He's also a Resident Advisor at UCSC. Mostly, he likes making stuff, figuring out how things work, and developing software that helps people.",
		hidden: true,
	},
];

export default async function TeamPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const dict = (await getDictionary(locale as Locale)) as { team?: TeamDict };
	const d = dict.team ?? {};
	const members = d.members;

	const resolved: TeamMemberView[] = team
		.filter((member) => !member.hidden)
		.map((member) => ({
			name: member.name,
			position: members?.[member.name]?.position ?? member.position,
			bio: members?.[member.name]?.bio ?? member.bio,
			school: member.school,
			campus: member.campus,
			chapter: member.chapter,
			photo: member.photo,
			socials: member.socials,
		}));

	return (
		<>
			<PageHero
				kicker=""
				contained
				title={
					<>
						{d.hero?.titleLine1 ?? "Driven by the"}
						<br />
						<em>{d.hero?.titleEm ?? "same frustration."}</em>
					</>
				}
				titleStyle={
					{ fontSize: "clamp(2.6rem,4.2vw,4.6rem)" } as React.CSSProperties
				}
			/>

			<section className="px-20 py-24 max-md:px-6 max-md:py-16">
				<div className="max-w-[1400px] mx-auto">
					<SectionTitle className="mb-16">
						{d.sectionTitle ?? "Meet the Team"}
					</SectionTitle>

					<TeamDirectory members={resolved} />
				</div>
			</section>

			<FadeUp>
				<section
					className="px-20 py-24 max-md:px-6 max-md:py-16 text-center"
					style={{ background: "var(--color-bg-page)" }}
				>
					<div className="max-w-[1400px] mx-auto">
						<h2 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.01em] mb-6">
							{d.cta?.headingPlain ?? "Want to be part of"}{" "}
							<em>{d.cta?.headingEm ?? "this?"}</em>
						</h2>
						<p className="text-[1.05rem] text-white leading-[1.7] max-w-[540px] mx-auto">
							{d.cta?.body ??
								"VINdicated is always looking for passionate people: researchers, developers, designers, educators, and advocates. If you believe car buying should be fair for everyone, we want to hear from you."}
						</p>
						<Button href="/join" className="mt-10">
							{d.cta?.button ?? "Get in Touch"}
						</Button>
					</div>
				</section>
			</FadeUp>
		</>
	);
}
