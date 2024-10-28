import FeedbackSection from "./FeedbackSection";
import Footer from "./Footer";
import HeroSection from "./HeroSection/HeroSection";
import notangles from '../../assets/notangles_1.png';
import FeaturesSection from "./KeyFeaturesSection/FeaturesSection";
import ScrollingFeaturesSection from "./ScrollingFeaturesSection";
import SponsorsSection from "./SponsorsSection";

const LandingPage = () => {
  return (
    <div className="bg-white snap-y snap-mandatory overflow-y-scroll h-screen">
      <header className='absolute top-0'>
        <div className='w-44 h-24 flex justify-center items-center'>
          <img src={notangles} className='w-12 cursor-pointer'/>
          <p className='font-semibold text-lg pl-1 cursor-pointer select-none'>Notangles</p>
        </div>
      </header>
      <div className="snap-center min-h-screen">
        <HeroSection />
      </div>
      <div className="snap-center min-h-screen flex flex-col justify-center items-center">
        <SponsorsSection />
        <FeaturesSection />
      </div>
      <ScrollingFeaturesSection />
      <div className="snap-center min-h-screen flex flex-col justify-between">
        <FeedbackSection />
        {/* Sticky Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
