import { PageHero } from "@/components/sections/shared/PageHero";
import { CtaBand, PeopleArt } from "@/components/sections/shared/CtaBand";
import {
	TeamRoster,
	type RosterMember,
} from "@/components/sections/team/TeamRoster";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRouteMetadata } from "@/lib/i18n/metadata";
import { positionRank } from "@/lib/team-rank";
import { team } from "@/lib/team";
import { localizeHref, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	return getRouteMetadata(locale, "team", "/team");
}

export default async function TeamPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const dict = await getDictionary(locale as Locale);
	const d = dict.teamPage;
	// Rank is always computed from the English position, regardless of
	// the page's locale, so member ordering never depends on how a
	// translation happens to word someone's title (see positionRank).
	const enMembers = (await getDictionary("en" as Locale)).team.members;
	const members: RosterMember[] = team
		.filter((member) => !member.hidden)
		.map((member, order) => {
			const entry = dict.team.members[member.name];
			if (!entry) {
				throw new Error(
					`Missing team dict entry for "${member.name}" -- add one to lib/i18n/dictionaries/en.json under team.members before adding them to the roster.`,
				);
			}
			const enPosition = enMembers[member.name]?.position ?? entry.position;
			return {
				rank: positionRank(enPosition),
				order,
				view: {
					name: member.name,
					position: entry.position,
					bio: entry.bio,
					major: member.major,
					chapter: member.chapter,
					photo: member.photo,
					socials: member.socials,
					video: member.video,
				},
			};
		})
		.sort((a, b) => a.rank - b.rank || a.order - b.order)
		.map((m) => m.view);

	return (
		<div className="rd rd-page">
			<PageHero title={d.hero.title} body={d.hero.body} />
			<section className="pt0">
				<div className="wrap">
					<TeamRoster members={members} dict={d} />
				</div>
			</section>
			<div className="team-cta">
				<CtaBand
					title={d.cta.title}
					body={d.cta.body}
					primary={{ label: d.cta.button, href: localizeHref(locale as Locale, "/join") }}
					art={<PeopleArt />}
				/>
			</div>
		</div>
	);
}
