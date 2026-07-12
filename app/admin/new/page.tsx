import { siteLayout, siteTypography } from "../../theme";
import ContentForm from "../ContentForm";

export default function NewPostPage() {
  return (
    <main
      className="mx-auto w-full max-w-3xl pb-16"
      style={{
        paddingLeft: siteLayout.sidePadding,
        paddingRight: siteLayout.sidePadding,
        paddingTop: siteLayout.headerTopSpace,
      }}
    >
      <h1 className="mb-10" style={siteTypography.pageTitle}>
        New post
      </h1>

      <ContentForm kind="post" mode="create" />
    </main>
  );
}
