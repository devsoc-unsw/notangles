import HeroSection from "./HeroSection/heroSection";
import SponsorsSection from "./SponsorsSection";
import { FlipWords } from "./flip-words";

const LandingPage = () => {
  return (
    <div className="bg-blue-100">
      <HeroSection />
      <SponsorsSection />
    </div>
  );
};

export default LandingPage;
