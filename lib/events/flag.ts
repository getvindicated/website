// Whether the Events page is public yet: the Railway variable EVENTS_PUBLIC
// set to exactly "true". Until then the page, its nav link, the home strip
// and the sitemap entry stay hidden (see BOARD_SETUP.md). Static pages read
// this at build time; Railway rebuilds when the variable changes.
export const eventsPublic = () => process.env.EVENTS_PUBLIC === "true";
