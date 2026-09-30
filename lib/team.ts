// The VINdicated roster. Positions and bios are translated, so they live in
// the dictionaries under team.members, keyed by `name`.

export type Chapter = "leadership" | "ucla" | "ucb" | "ucsc";
export type Social = {
	platform: "linkedin" | "github" | "instagram" | "website";
	href: string;
};

export type TeamVideo = {
	src: string;
	poster: string;
	length: string;
	portrait: boolean;
};

// Videos live in public/videos/<slug>.mp4 with a poster at
// public/images/team-videos/<slug>.webp.
function video(slug: string, length: string, shape?: "portrait"): TeamVideo {
	return {
		src: `/videos/${slug}.mp4`,
		poster: `/images/team-videos/${slug}.webp`,
		length,
		portrait: shape === "portrait",
	};
}

export type TeamMember = {
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
	// Short video intro, if the member recorded one (see TEAM_VIDEOS).
	video?: TeamVideo;
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
export const team: TeamMember[] = [
	{
		name: "Rana Darwich",
		photo: "/team/rana.png",
		chapter: "leadership",
	},
	{
		name: "Fiona Wangsawidjaja",
		video: video("fiona-wangsawidjaja", "0:06", "portrait"),
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
		video: video("rizwaan-bana", "0:07", "portrait"),
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
		video: video("ayat-ashraf", "0:06", "portrait"),
		major: "Math/Econ",
		photo: "/team/ayat.png",
		chapter: "ucla",
	},
	{
		name: "Noirit Ghosh Choudhuri",
		video: video("noirit-ghosh-choudhuri", "0:14"),
		major: "Computer Science",
		photo: "/team/noirit.jpg",
		chapter: "ucb",
	},
	{
		name: "Halima Cherif Hminat",
		video: video("halima-cherif-hminat", "0:19"),
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
		video: video("fernando-cedillo-hernandez", "0:04", "portrait"),
		major: "Biology & Political Science",
		photo: "/team/fernando.png",
		chapter: "ucla",
	},
	{
		name: "Jordan Acle",
		video: video("jordan-acle", "0:15"),
		major: "Data Science",
		photo: "/team/jordan.jpg",
		chapter: "ucb",
	},
	{
		name: "Yinrui (Ray) Gan",
		video: video("ray-gan", "0:07", "portrait"),
		major: "Computer Science & Linguistics",
		photo: "/team/ray.jpg",
		chapter: "ucla",
	},
	{
		name: "Evanceline Tang",
		video: video("evanceline-tang", "0:05", "portrait"),
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
		video: video("daryen-romero", "0:14"),
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
		video: video("brisa-gomez", "0:05", "portrait"),
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
		video: video("daniel", "0:26", "portrait"),
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
