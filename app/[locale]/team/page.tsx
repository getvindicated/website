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
import { localeDict, type Locale } from "@/lib/i18n/config";
import type { TeamDict } from "@/lib/i18n/dictionary";

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
	// English fallbacks, used if a dictionary entry is missing for this index
	position: string;
	bio: string;
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
		position: "Founder & President",
		photo: "/team/rana.png",
		chapter: "leadership",
		bio: "Rana Darwich is a student researcher at UC Berkeley and the Founder & President of VINdicated, which now runs chapters at UCLA, Berkeley, and UC Santa Cruz. She is a Research Assistant at UC Berkeley's School of Education studying gender equity in university athletics funding, a Research Apprentice at Berkeley Law's Center for Comparative Inequality and Anti-Discrimination Law, and a former Student Researcher at the Political Violence Lab. She previously interned at Amazon and is currently an Opinion writer at The Daily Californian.",
	},
	{
		name: "Fiona Wangsawidjaja",
		position: "President",
		major: "Statistics & Data Science",
		photo: "/team/fiona.jpg",
		chapter: "ucla",
		bio: "Fiona Wangsawidjaja is a Statistics and Data Science major at UCLA and the current President of the UCLA VINdicated chapter. Fiona loves to educate and help her community when she can, whether through her past experience as a coding tutor, helping others learn about the digital world through conferences, or here at VINdicated, where she hopes people can benefit from accessible automotive literacy. She has experience specializing in data through organizations such as DataRes and NSDC, teaching high school students about data, building data analysis projects, and consulting companies.",
	},
	{
		name: "Ashwin Vinod",
		position: "President",
		major: "Computer Science",
		photo: "/team/ashwin.jpg",
		chapter: "ucsc",
		socials: [{ platform: "website", href: "https://aiea-lab.github.io" }],
		bio: "Ashwin Vinod is a Computer Science major at UCSC. He is the President of the VINdicated chapter at UCSC. Through involvement in various research labs and software engineering experiences, Ashwin has built a technical foundation that he wants to use to push computational research that benefits the community, and provide educational opportunities for his community. Ashwin previously interned at IBM as a Software Developer Intern, and is continuing his interest in research as part of the AIEA Lab @ UCSC, focused on explainable artificial intelligence.",
	},
	{
		name: "Rizwaan Bana",
		position: "UCLA Chapter Director",
		photo: "/team/rizwaan.jpg",
		chapter: "leadership",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/rizwaanbana/" }],
		bio: "Rizwaan Bana is a Computer Science major at UCLA. He is the Chapter Director at VINdicated @ UCLA, where he helps streamline the chapters' outreach and project strategies. He also serves as the Internal Vice President of Bruin Software Engineers, Dev Team Project Manager for ACM @ UCLA, and Web Chair for UPE @ UCLA.",
	},
	{
		name: "William Prawira",
		position: "Internal Vice President",
		major: "Data Science & Applied Mathematics",
		photo: "/team/william.jpg",
		chapter: "ucla",
		bio: "Will Prawira is a Math & Data Science major at UCLA and the Internal VP of the VINdicated chapter there. With his background in data science and industry experience, Will hopes to push a culture of rapid, high-quality execution, turning ambitious ideas into valuable resources for the community. He is currently interning at Navitas Semiconductor through the academic year as a Reliability Intern, where he develops tools and applications focused on automation and product lifetime prediction modeling.",
	},
	{
		name: "Ayat Ashraf",
		position: "External Vice President",
		major: "Math/Econ",
		photo: "/team/ayat.png",
		chapter: "ucla",
		bio: "Ayat Ashraf is a Math/Econ major at UCLA interested in economic policymaking. She does research at VINdicated, so she can hopefully buy a car without calling her dad 8,000 times in the future.",
	},
	{
		name: "Noirit Ghosh Choudhuri",
		position: "Internal Vice President",
		major: "Computer Science",
		photo: "/team/noirit.jpg",
		chapter: "ucb",
		bio: "Noirit Ghosh Choudhuri is a Computer Science major at UC Berkeley. He is the Internal Vice President of the VINdicated chapter at UC Berkeley. Through his experience developing multiple real world projects, Noirit has built strong technical and collaborative skills that he wants to use to build more solutions to pressing societal issues, such as the one VINdicated stands to fight.",
	},
	{
		name: "Halima Cherif Hminat",
		position: "External Vice President",
		major: "Integrative Biology",
		photo: "/team/halima.jpg",
		chapter: "ucb",
		bio: "Halima Cherif Hminat is an Integrative Biology student at UC Berkeley, minoring in Sustainable Business and Policy, and is on the pre-dental track. She is also the EVP at VINdicated @ UC Berkeley and contributes to creating resources that help people make informed decisions with confidence. She says VINdicated's mission is important because she wants to support women by helping them prevent unfair treatment in car buying and repairs.",
	},
	{
		name: "Gundeep Sambee",
		position: "Internal Vice President",
		major: "Cognitive Science",
		photo: "/team/gundeep.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/gundeep-k-sambee/" }],
		bio: "Gundeep is a Cognitive Science student at UC Santa Cruz, minoring in Technology and Information Management. She's interested in the intersection of people and technology, especially how AI, design, and psychology shape the way we make decisions. Outside class, she's involved in research and enjoys opportunities to learn more about human behavior and cognition, and likes taking on leadership roles that build community and create meaningful experiences for others.",
	},
	{
		name: "Adhya Maddukuri",
		position: "External Vice President",
		major: "Technology & Information Management",
		photo: "/team/adhya.jpg",
		chapter: "ucsc",
		socials: [{ platform: "linkedin", href: "https://www.linkedin.com/in/adhya-maddukuri-82a88a339" }],
		bio: "Adhya is a Technology and Information Management student at UC Santa Cruz with a passion for building technology that creates real-world impact, spanning software development, AI, data analytics, and product strategy. She's conducted undergraduate research in generative AI, consulted with nonprofits through 180 Degrees Consulting, and helped organize hackathons with NVIDIA and ASUS. She's currently a Software Development Engineering Intern at Heron Power, building software systems and strengthening her technical and problem-solving skills.",
	},
	{
		name: "Fernando Cedillo-Hernandez",
		position: "Research Lead",
		major: "Biology & Political Science",
		photo: "/team/fernando.png",
		chapter: "ucla",
		bio: "Fernando Cedillo-Hernandez is a Biology and Political Science double major at UCLA, with minors in Biomedical Research and Community Engagement and Social Change. He brings a background in research and civic advocacy to his role as Research Lead at VINdicated, driven by a commitment to expanding equitable access and protection for underserved communities. Outside VINdicated, Fernando is involved in leadership and community engagement work across UCLA, including advocacy for immigrant and working-class students.",
	},
	{
		name: "Yinrui (Ray) Gan",
		position: "Data Lead",
		major: "Computer Science & Linguistics",
		photo: "/team/ray.jpg",
		chapter: "ucla",
		bio: "Ray Gan leads the data and AI pipeline for VINdicated's interactive dealership risk map. He designed the LLM-based classification system that turns unstructured consumer reviews into transparent, evidence-backed risk signals for car buyers. Ray studies Computer Science and Linguistics at UCLA.",
	},
	{
		name: "Evanceline Tang",
		position: "Design Lead & Outreach Lead",
		major: "Biology",
		photo: "/team/evanceline.jpg",
		chapter: "ucla",
		bio: "Evanceline is a second year biology major at UCLA. She is passionate about using art and design as a mean of conveying messages. Through her art, she hopes to help people understand more about VINdicated and the existing inequalities and dangers in the automotive industry.",
	},
	{
		name: "Rouqaya Elbanna",
		position: "HS Lead",
		photo: "/team/rouqaya.png",
		chapter: "ucla",
		bio: "Rouqaya Elbanna is a high school student and the HS Lead at VINdicated, where she works to bring the organization's consumer protection mission to a wider student audience. She previously served as Vice President of TEDxAIS Jeddah Youth and was selected for the Learn with Leaders Future Doctors Fellowship, where her capstone health education campaign on Alzheimer's caregiving earned Best Presentation of the cohort. An aspiring physician, Rouqaya also competes as a varsity volleyball athlete and was honored with her school's Female Scholar Athlete Award.",
	},
	{
		name: "Daryen Romero",
		position: "Technical Writing Lead",
		major: "Computer Science",
		photo: "/team/daryen.jpg",
		chapter: "ucb",
		bio: "Daryen Romero is a Computer Science student at UC Berkeley. Joining VINdicated is important to him because he wants to help others be informed about the importance of buying a car and not be afraid. He also wants to speak out and help others understand how people can be taken advantage of if they are a woman or a different race.",
	},
	{
		name: "Vanessa Phan",
		position: "Data Analytics Lead",
		major: "Computer Engineering",
		photo: "/team/vanessa.jpg",
		chapter: "ucsc",
		socials: [
			{ platform: "linkedin", href: "https://www.linkedin.com/in/vanessaphan06" },
			{ platform: "github", href: "https://github.com/vqnnie" },
		],
		bio: "Vanessa is pursuing a degree in Computer Engineering with a concentration in Computer Systems, interested in the combination of software and electrical engineering, especially robotics and intelligent technologies. She's the Treasurer for the Society of Women Engineers at UC Santa Cruz, where she's secured more than $5,000 in funding this year, and has been involved in SlothLab as a developer. She wants to get more involved in research, digging into topics in detail and applying what she learns to build solutions.",
	},
	{
		name: "Brisa Gómez",
		position: "Technical Writing Lead",
		major: "Psychology",
		photo: "/team/brisa.png",
		chapter: "ucla",
		bio: "Brisa Gómez is a fourth-year Psychology major at UCLA and the Technical Writing Lead at UCLA. Through their involvement in various writing and translation projects, Brisa wants to use that experience to promote accessible and comprehensive resources that are inclusive to vulnerable populations.",
	},
	{
		name: "Pierce Kosobayashi",
		position: "Project Manager",
		major: "Media Studies & Education",
		photo: "/team/pierce.jpg",
		chapter: "ucb",
		bio: "Pierce Kosobayashi is a fourth-year Media Studies and Education student at UC Berkeley. He brings a background in digital and retail automotive sales and finance, along with experience in OEM sales analysis and marketing, to his work as Project Manager at VINdicated. A car enthusiast at heart, Pierce wants to use his industry experience to help future buyers navigate the process with confidence. Outside VINdicated, he enjoys ocean swimming, hiking, and spending time with his dog and cat.",
	},
	{
		name: "Chino Sawatyanont",
		position: "Software Engineer",
		major: "Electrical & Computer Engineering",
		photo: "/team/chino.png",
		chapter: "ucb",
		bio: "Chino is an Electrical and Computer Engineering major at UC Berkeley and a Software Engineer for the VINdicated chapter there. He brings extensive experience combining technical knowledge with societal impact, having previously focused on supporting underprivileged communities in Thailand. Chino hopes to bring that same drive for impact to VINdicated's mission.",
	},
	{
		name: "William Guo",
		position: "Software Engineer",
		major: "Computer Science",
		photo: "/team/williamguo.png",
		chapter: "ucsc",
		bio: "William Guo is a junior studying Computer Science at UC Santa Cruz and a Software Engineer at VINdicated. He enjoys tinkering with and fixing electronics, playing video games, and getting hands-on with his own projects. Having gone through the stressful process of searching for the right vehicle himself, William resonates deeply with VINdicated's mission and believes the basics of what to look for in a major purchase like a car should be more readily available to everyone.",
	},
	{
		name: "Daniel",
		position: "Data Engineer",
		major: "Applied Mathematics",
		photo: "/team/daniel.png",
		chapter: "ucb",
		bio: "Daniel is a transfer Applied Math student from Los Angeles and Data Engineer at VINdicated, with a strong interest in personal finance and teaching financial literacy to others. Outside of VINdicated, he enjoys tearing down and repairing computers, hiking, cycling, and running around the city. He's also gotten into climbing, cooking, and going to music festivals.",
	},
	{
		name: "Chloe Lin",
		position: "Outreach Lead",
		major: "Integrative Biology",
		photo: "/team/chloe.png",
		chapter: "ucb",
		bio: "Chloe Lin is an Integrative Biology student at UC Berkeley serving as Outreach Lead at VINdicated. Her experience advocating for women and underrepresented communities drives her commitment to bridging knowledge gaps in the automotive industry. She is dedicated to empowering everyday consumers to navigate car purchases and maintenance with clarity and confidence.",
	},
	{
		name: "Ian de la Houssaye",
		position: "Software Lead",
		major: "Mechanical Engineering",
		photo: "/team/ian.jpg",
		chapter: "ucb",
		bio: "Ian de la Houssaye is a Mechanical Engineering student and the Software Lead for the VINdicated chapter at UC Berkeley. He has a passion for building technology that solves real-world problems. Ian founded and led his high school's competitive robotics team, helping it become one of San Diego's top-performing teams while directing the development of its software and autonomous systems. Through these experiences, he has developed strong technical, leadership, and collaborative skills that he hopes to use to advance VINdicated's mission.",
	},
	{
		name: "James Cheng",
		position: "Data Engineer",
		major: "Data Science & Cognitive Science",
		photo: "/team/james.png",
		chapter: "ucb",
		bio: "James is a Data Science and Cognitive Science student at UC Berkeley and a Data Engineer at VINdicated. He brings extensive experience in both STEM and language education, along with a diverse technical background and experience building independent projects. He hopes to draw on these experiences to bring a unique perspective and strong initiative to solving problems in the automotive industry."
	},
	{
		name: "Bryan Zhang",
		position: "Software Engineer",
		major: "Computer Science",
		photo: "/team/bryan.png",
		chapter: "ucla",
		bio: "Bryan Zhang is a CS major at UCLA. In his free time he enjoys playing basketball, volleyball, and baking. He is a developer for VINdicated.",
	},
	{
		name: "Rahul Puritipati",
		position: "Software Engineer",
		major: "Computer Science",
		photo: "/team/rahul.jpg",
		chapter: "ucla",
		bio: "Rahul Puritipati is a first-year CS student at UCLA. Raised in Folsom, CA, he likes to watch gym TikToks and be a couch GM for the 49ers and Kings. He has done a significant amount of nonprofit work, mainly rebuilding local businesses' online presence and raising money for underprivileged youth in India.",
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
	const dict = (await getDictionary(locale as Locale)) as { team?: TeamDict };
	const d = localeDict(locale, dict.team) ?? {};
	const members = d.members;

	const resolved: TeamMemberView[] = team
		.filter((member) => !member.hidden)
		.map((member) => ({
			name: member.name,
			position: members?.[member.name]?.position ?? member.position,
			bio: members?.[member.name]?.bio ?? member.bio,
			major: member.major,
			chapter: member.chapter,
			photo: member.photo,
			socials: member.socials,
		}));

	return (
		<div style={{ background: PAGE_BG }}>
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
					style={{ background: PAGE_BG }}
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
		</div>
	);
}
