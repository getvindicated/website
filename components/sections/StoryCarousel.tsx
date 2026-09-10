import { Fragment } from "react";
import Image from "next/image";

type Strike = { num?: string; label?: string; body?: string[] };

// Desktop-only art beside each stop. Strike 1 has a real photo; the
// other two don't have one yet, so they get a small line-icon that
// echoes a concrete detail from that strike's story instead of a
// generic "image coming soon" placeholder.
function BlockedMessageIcon() {
	return (
		<svg viewBox="0 0 64 64" width={40} height={40} aria-hidden="true">
			<path
				d="M14 18c0-3.3 2.7-6 6-6h24c3.3 0 6 2.7 6 6v18c0 3.3-2.7 6-6 6H30l-9 8v-8h-1c-3.3 0-6-2.7-6-6V18Z"
				fill="none"
				stroke="var(--color-accent)"
				strokeWidth="2.5"
			/>
			<path
				d="M22 40 42 20"
				stroke="var(--color-accent)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

function LockedDrawerIcon() {
	return (
		<svg viewBox="0 0 64 64" width={40} height={40} aria-hidden="true">
			<rect
				x="12"
				y="30"
				width="40"
				height="20"
				rx="3"
				fill="none"
				stroke="var(--color-accent)"
				strokeWidth="2.5"
			/>
			<path
				d="M26 30v-6a6 6 0 0 1 12 0v6"
				fill="none"
				stroke="var(--color-accent)"
				strokeWidth="2.5"
			/>
			<circle cx="32" cy="40" r="2.5" fill="var(--color-accent)" />
		</svg>
	);
}

function StopArt({ index }: { index: number }) {
	if (index === 0) {
		return (
			<Image
				src="/pink-slip.png"
				alt="A vehicle title, the document a pink slip scam tries to keep out of the buyer's hands"
				fill
				className="object-cover"
				sizes="200px"
			/>
		);
	}
	return (
		<div className="w-full h-full flex items-center justify-center">
			{index === 1 ? <BlockedMessageIcon /> : <LockedDrawerIcon />}
		</div>
	);
}

// Each strike is a stop on the same road: a dot, a dashed run of
// lane-marking down to the next one, same grammar as the route icon
// used elsewhere on the site. All three read at once, in order.
// A desktop-only third column carries a small image/icon per stop —
// the same CSS grid rows keep it vertically locked to its strike.
export function StoryCarousel({ strikes }: { strikes: Strike[] }) {
	return (
		<div className="grid grid-cols-[12px_1fr] lg:grid-cols-[12px_1fr_200px] gap-x-7 lg:gap-x-10">
			{strikes.map((s, i) => {
				const isLast = i === strikes.length - 1;
				const pad = isLast ? "" : "pb-14 max-md:pb-10";
				return (
					<Fragment key={i}>
						<div className={`relative flex flex-col items-center ${pad}`}>
							<span
								aria-hidden="true"
								className="rounded-full flex-shrink-0"
								style={{
									width: 12,
									height: 12,
									marginTop: 8,
									background: "var(--color-accent)",
									boxShadow: "0 0 0 4px rgba(149,51,165,0.15)",
								}}
							/>
							{!isLast && (
								<span
									aria-hidden="true"
									className="flex-1"
									style={{
										width: 0,
										marginTop: 6,
										marginBottom: 6,
										borderLeft: "2px dashed rgba(149,51,165,0.35)",
									}}
								/>
							)}
						</div>

						<div className={pad}>
							<h3
								className="text-[1.3rem] leading-[1.3] mb-4"
								style={{ color: "var(--color-accent)" }}
							>
								<span className="sr-only">
									Strike {i + 1} of {strikes.length}:{" "}
								</span>
								{s.label}
							</h3>
							<div className="space-y-3 max-w-[680px]">
								{s.body?.map((p, j) => (
									<p
										key={j}
										className="text-[0.97rem] text-white leading-[1.75]"
									>
										{p}
									</p>
								))}
							</div>
						</div>

						<div className={`hidden lg:block lg:ml-10 ${pad}`}>
							<div
								className="relative rounded-2xl overflow-hidden"
								style={{
									width: 200,
									height: 150,
									border: "1px solid var(--color-border)",
									background: "var(--color-bg-surface)",
								}}
							>
								<StopArt index={i} />
							</div>
						</div>
					</Fragment>
				);
			})}
		</div>
	);
}
