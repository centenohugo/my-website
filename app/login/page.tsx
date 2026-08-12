import type { Metadata } from "next";
import { siteLayout, siteTypography } from "../theme";
import LoginForm from "./LoginForm";

// robots.txt disallows /login, but a crawler that reaches it some other way
// (a stray link) still shouldn't index it.
export const metadata: Metadata = {
  title: "Access",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main
      className="mx-auto w-full max-w-sm pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <h1 className="mb-8" style={siteTypography.pageTitle}>
        Access
      </h1>

      <LoginForm />
    </main>
  );
}
