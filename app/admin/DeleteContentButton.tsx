"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminTypography } from "./theme";

export default function DeleteContentButton({
  apiBase,
  slug,
  redirectTo,
}: {
  apiBase: string;
  slug: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Borrar esta entrada? Esta acción no se puede deshacer.")) {
      return;
    }

    setPending(true);
    await fetch(`${apiBase}/${slug}`, { method: "DELETE" });

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="uppercase"
      style={{ ...adminTypography.buttonSecondary, cursor: "pointer" }}
    >
      {pending ? "Borrando…" : "Borrar"}
    </button>
  );
}
