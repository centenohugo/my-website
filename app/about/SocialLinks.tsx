import { IconBrandGithub } from "@tabler/icons-react";
import { FACE_PARAMS } from "../faceConfig";

const ICON_SIZE = 30;
const STROKE_WIDTH = 2;

// TODO: LinkedIn and X point at placeholder profiles — swap in the real URLs.
const SOCIALS = [
  { name: "GitHub", href: "https://github.com/centenohugo", icon: GitHubIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/hugocentenosanz/", icon: LinkedInIcon },
  { name: "Email", href: "mailto:hcienteno@gmail.com", icon: EmailIcon },
] as const;

/**
 * Social links drawn in the doodle's own hand: single-stroke marks in the
 * figure ink, slightly wobbly on purpose so they sit next to the face
 * without breaking style. Brand icons would clash with everything else on
 * the site.
 */
export default function SocialLinks() {
  return (
    <div className="flex items-center gap-5">
      {SOCIALS.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          aria-label={name}
          title={name}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-dashed focus-visible:outline-offset-4 focus-visible:outline-[#262019]"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 32 32"
      aria-hidden="true"
      stroke={FACE_PARAMS.figureColor}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {children}
    </svg>
  );
}

// Tabler's outline octocat: stroke-based with round caps, so it sits next to
// the hand-drawn icons without breaking style. Rendered slightly smaller with
// a thinner stroke to match their apparent ink weight (they draw in a 32
// viewBox, Tabler in 24).
function GitHubIcon() {
  return (
    <IconBrandGithub
      size={ICON_SIZE * 0.87}
      strokeWidth={STROKE_WIDTH * 0.85}
      color={FACE_PARAMS.figureColor}
      aria-hidden="true"
    />
  );
}

// rounded square with a handwritten "in"
function LinkedInIcon() {
  return (
    <IconSvg>
      <path d="M9.8 6.5 C7.6 6.6 6.5 7.7 6.5 9.9 L6.4 22.2 C6.4 24.3 7.7 25.5 9.8 25.5 L22.1 25.6 C24.3 25.6 25.5 24.3 25.5 22.1 L25.6 9.9 C25.6 7.7 24.3 6.5 22.1 6.5 Z" />
      <circle cx="11.4" cy="11.7" r="1.3" fill={FACE_PARAMS.figureColor} stroke="none" />
      <path d="M11.4 14.8 C11.3 17.2 11.4 19.5 11.4 21.7" />
      <path d="M15.7 21.7 L15.7 14.9" />
      <path d="M15.8 17.4 C16.4 15.2 20.6 14.3 20.6 17.9 L20.6 21.7" />
    </IconSvg>
  );
}
// an envelope
function EmailIcon() {
  return (
    <IconSvg>
      <path d="M6.6 9.5 L25.4 9.3 C25.6 13.7 25.6 18.2 25.4 22.5 L6.7 22.6 C6.4 18.3 6.4 13.9 6.6 9.5 Z" />
      <path d="M7.3 10.3 C10.2 13 13.5 15.7 16 17.1 C18.5 15.7 21.8 13 24.7 10.3" />
    </IconSvg>
  );
}
