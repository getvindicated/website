export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	// The real <html>/<body> shell lives in app/[locale]/layout.tsx --
	// it needs the route's locale to set `lang`/`dir` and the font
	// variable classes, which this outer root layout doesn't have
	// access to. A second <html>/<body> pair here causes a hydration
	// mismatch, so this file just passes children through.
	return children;
}
