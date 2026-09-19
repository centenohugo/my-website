import Link from "next/link";
import { formatFullDate } from "@/lib/i18n/formatDate";
import CopyLinkButton from "./CopyLinkButton";
import DeleteContentButton from "./DeleteContentButton";
import { adminColors, adminTypography } from "./theme";

export type AdminListItem = {
  slug: string;
  title: string;
  status: "draft" | "published";
  share_token: string;
  published_at: string | null;
};

export default function AdminList({
  items,
  apiBase,
  editHrefBase,
  publicHrefBase,
  emptyLabel,
}: {
  items: AdminListItem[];
  apiBase: string;
  editHrefBase: string;
  publicHrefBase: string;
  emptyLabel: string;
}) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div
          key={item.slug}
          className="flex items-center justify-between gap-4 border-b py-4"
          style={{ borderColor: adminColors.tagPlaceholder }}
        >
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate" style={adminTypography.listTitle}>
              {item.title}
            </span>
            {/* items-center keeps the badge hugging its own text: as a stretched
                column flex item it would take the width of the title above it,
                so badges came out a different size on every row. */}
            <span className="flex items-center gap-2">
              <span className="uppercase" style={adminTypography.badge}>
                {item.status === "published" ? "Published" : "Draft"}
              </span>
              <span className="uppercase" style={adminTypography.listMeta}>
                {/* The admin panel is English-only. */}
                {formatFullDate(item.published_at, "en") || "No date"}
              </span>
            </span>
          </div>

          {/* shrink-0 keeps a long title from squeezing the actions until their
              labels wrap onto a second line. */}
          <div className="flex shrink-0 items-center gap-3">
            <CopyLinkButton
              publicHrefBase={publicHrefBase}
              slug={item.slug}
              shareToken={item.share_token}
              status={item.status}
            />
            <Link
              href={`${editHrefBase}/${item.slug}/edit`}
              className="inline-block text-center uppercase"
              style={adminTypography.listAction}
            >
              Edit
            </Link>
            <DeleteContentButton apiBase={apiBase} slug={item.slug} />
          </div>
        </div>
      ))}

      {items.length === 0 && <p style={adminTypography.label}>{emptyLabel}</p>}
    </div>
  );
}
