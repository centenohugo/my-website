"use client";

import { useRouter } from "next/navigation";
import { adminTypography } from "./theme";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="uppercase"
      style={adminTypography.buttonSecondary}
    >
      Cerrar sesión
    </button>
  );
}
