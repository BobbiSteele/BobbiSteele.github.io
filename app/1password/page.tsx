import { TrainingPresentation } from "./Presentation";
import { introSlides, branches } from "./slides";

export default function OnePasswordPage() {
  return (
    <TrainingPresentation
      introSlides={introSlides}
      branches={branches}
      title="1Password Training"
      subtitle="Best practices for creating and managing strong passwords with 1Password and why it matters for security."
    />
  );
}
