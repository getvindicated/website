// Founder > chapter directors > president > internal VP > VP > external VP
// > strategists > leads > everyone else. Ties keep the order members were
// given in.
// Takes the member's *English* position -- callers must not pass a
// translated string, since these regexes only match English text. Plain
// module (no "use client") so both the server-rendered team page and the
// client-rendered TeamDirectory can call it.
export function positionRank(position: string): number {
	if (/founder/i.test(position)) return 0;
	if (/chapter director/i.test(position)) return 1;
	if (/president/i.test(position) && !/vice/i.test(position)) return 2;
	if (/internal vice president/i.test(position)) return 3;
	if (/external vice president/i.test(position)) return 5;
	if (/vice president/i.test(position)) return 4;
	if (/strategist/i.test(position)) return 5.5;
	if (/\blead(s)?\b/i.test(position)) return 6;
	return 7;
}
