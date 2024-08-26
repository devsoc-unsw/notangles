import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection/heroSection";
import SponsorsSection from "./SponsorsSection";

const LandingPage = () => {
  return (
    <div className="bg-blue-100 min-h-[3000px]">
      <HeroSection />
      <FeaturesSection />
      <SponsorsSection />
    </div>
  );
};

export default LandingPage;
