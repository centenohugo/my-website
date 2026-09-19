/**
 * Schema.org data as JSON-LD. Agents and search engines both read it, and it
 * states plainly what the visible page only implies (who wrote this, when, in
 * what language). Facts here must also exist in the visible HTML: some
 * fetchers strip <script> before handing the page to a model.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a title containing "</script>" cannot break out.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  );
}
