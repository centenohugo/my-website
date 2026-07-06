import { siteLayout, siteTypography } from "../theme";
import LoginForm from "./LoginForm";

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
