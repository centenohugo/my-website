import { siteLayout, siteTypography } from "../../../theme";
import ContentForm from "../../ContentForm";

export default function NewProjectPage() {
  return (
    <main
      className="mx-auto max-w-3xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <h1 className="mb-10" style={siteTypography.pageTitle}>
        New project
      </h1>

      <ContentForm kind="project" mode="create" />
    </main>
  );
}
