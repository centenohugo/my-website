// Structured data. Renders no visible DOM — a <script> of type
// application/ld+json is inert to the browser and read only by crawlers.

/**
 * `</script>` appearing inside a string value would close the tag early, so the
 * `<` is escaped. JSON.stringify does not do this for us.
 */
function serialize(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  )
}
