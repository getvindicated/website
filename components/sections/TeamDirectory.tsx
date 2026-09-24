"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FadeUp } from "@/components/ui";

export type Social = {
	platform: "linkedin" | "github" | "instagram" | "website";
	href: string;
};

export type Chapter = "leadership" | "ucla" | "ucb" | "ucsc";

export type TeamMemberView = {
	name: string;
	position: string;
	bio: string;
	// Sort key, computed by the page from the member's *English* position
	// via lib/team-rank.ts's positionRank() so the ordering is identical
	// in every locale -- not derived from the translated `position` text
	// above, which positionRank's English-only regexes wouldn't match.
	rank: number;
	major?: string;
	chapter: Chapter;
	photo: string | null;
	socials?: Social[];
};

const CHAPTER_OPTIONS: { value: "all" | Chapter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "leadership", label: "Leadership" },
	{ value: "ucla", label: "UCLA" },
	{ value: "ucb", label: "UC Berkeley" },
	{ value: "ucsc", label: "UC Santa Cruz" },
];

// No mascot for "leadership" -- it isn't tied to a single campus.
const CHAPTER_MASCOT: Partial<Record<Chapter, string>> = {
	ucla: "/ucla-mascot.png",
	ucb: "/berkeley-mascot.png",
	ucsc: "/ucsc-mascot.png",
};

// No school name for "leadership" -- it isn't tied to a single campus.
const CHAPTER_SCHOOL: Partial<Record<Chapter, string>> = {
	ucla: "UCLA",
	ucb: "UC Berkeley",
	ucsc: "UC Santa Cruz",
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

export function TeamDirectory({ members }: { members: TeamMemberView[] }) {
	const [query, setQuery] = useState("");
	const [chapter, setChapter] = useState<"all" | Chapter>("all");

	const sorted = useMemo(
		() => [...members].sort((a, b) => a.rank - b.rank),
		[members],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return sorted.filter((m) => {
			if (chapter !== "all" && m.chapter !== chapter) return false;
			if (!q) return true;
			return (
				m.name.toLowerCase().includes(q) ||
				(m.major?.toLowerCase().includes(q) ?? false) ||
				m.position.toLowerCase().includes(q)
			);
		});
	}, [sorted, query, chapter]);

	return (
		<div>
			{/* Search + school filter */}
			<div className="flex flex-wrap items-center gap-3 mb-14 max-md:mb-10">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search the team by name, major, or role"
					aria-label="Search the team"
					className="flex-1 min-w-[240px] text-[0.95rem] px-4 py-3 rounded-lg outline-none transition-colors duration-150 focus:border-[var(--color-accent)]"
					style={{
						background: "var(--color-bg-surface)",
						border: "1px solid var(--color-border)",
						color: "#fff",
					}}
				/>
				<div
					className="flex gap-2 flex-wrap"
					role="group"
					aria-label="Filter by chapter"
				>
					{CHAPTER_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => setChapter(opt.value)}
							aria-pressed={chapter === opt.value}
							className="text-[0.85rem] font-semibold px-4 py-3 rounded-lg cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
							style={{
								color: "#fff",
								border: "1px solid var(--color-border)",
								background:
									chapter === opt.value
										? "rgba(149,51,165,0.16)"
										: "transparent",
								outlineColor:
									chapter === opt.value ? "var(--color-accent)" : undefined,
							}}
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{filtered.length === 0 ? (
				<p className="py-16 text-center text-[1rem] text-white/60">
					No one matches that search.
				</p>
			) : (
				<div className="space-y-0">
					{filtered.map((member) => {
						const mascot = CHAPTER_MASCOT[member.chapter];
						const school = CHAPTER_SCHOOL[member.chapter];
						const label = member.major
							? school
								? `${member.major}, ${school}`
								: member.major
							: school;
						return (
							<FadeUp key={member.name}>
								<div className="grid grid-cols-[280px_1fr_auto] gap-10 items-center py-12 max-lg:grid-cols-1 max-lg:gap-6 max-lg:py-8 max-lg:text-center max-lg:justify-items-center">
									{/* Photo */}
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

									{/* Info */}
									<div>
										<h3 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] tracking-[-0.01em] mb-2">
											{member.name}
										</h3>
										<p
											className="text-[1.15rem] font-bold mb-1"
											style={{ color: "var(--color-accent)" }}
										>
											{member.position}
										</p>
										<div className="flex items-center gap-2 mb-5 max-lg:justify-center">
											{label && (
												<p
													className="text-[1.15rem] font-bold text-white"
													style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
												>
													{label}
												</p>
											)}
											{mascot && (
												<Image
													src={mascot}
													alt=""
													width={28}
													height={28}
													className="h-7 w-auto object-contain"
												/>
											)}
										</div>
										<p className="text-[0.95rem] text-white leading-[1.75] max-w-202">
											{member.bio}
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
							</FadeUp>
						);
					})}
				</div>
			)}
		</div>
	);
}
