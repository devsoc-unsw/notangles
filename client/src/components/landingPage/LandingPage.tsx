import Footer from "../footer/Footer";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection/heroSection";
import ScrollingFeaturesSection from "./ScrollingFeaturesSection";
import SponsorsSection from "./SponsorsSection";

const LandingPage = () => {
  return (
    <div className="bg-blue-100 min-h-[3000px]">
      <HeroSection />
      <FeaturesSection />
      <SponsorsSection />
      <ScrollingFeaturesSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
