import FeedbackSection from "./FeedbackSection";
import Footer from "./Footer";
import HeroSection from "./HeroSection/heroSection";
import FeaturesSection from "./KeyFeaturesSection/FeaturesSection";
import ScrollingFeaturesSection from "./ScrollingFeaturesSection";
import SponsorsSection from "./SponsorsSection";

const LandingPage = () => {
  return (
    <div className="bg-blue-100 min-h-[3000px]">
      <HeroSection />
      <SponsorsSection />
      <FeaturesSection />
      <ScrollingFeaturesSection />
      <FeedbackSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
