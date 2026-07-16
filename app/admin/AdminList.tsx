import Link from "next/link";
import CopyLinkButton from "./CopyLinkButton";
import DeleteContentButton from "./DeleteContentButton";
import { adminColors, adminTypography } from "./theme";

export type AdminListItem = {
  slug: string;
  title: string;
  status: "draft" | "published";
  share_token: string;
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
          <div className="flex flex-col gap-1">
            <span style={adminTypography.listTitle}>{item.title}</span>
            <span className="uppercase" style={adminTypography.badge}>
              {item.status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <CopyLinkButton
              publicHrefBase={publicHrefBase}
              slug={item.slug}
              shareToken={item.share_token}
              status={item.status}
            />
            <Link
              href={`${editHrefBase}/${item.slug}/edit`}
              className="uppercase"
              style={adminTypography.buttonSecondary}
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
