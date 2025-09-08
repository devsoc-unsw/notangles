import { useState } from 'react';

import { API_URL } from '../../api/config';
import notangles from '../../assets/notangles_1.png';
import { useAuth } from '../../hooks/useAuth';
import AuthModal, { AuthModalProps } from '../login/AuthModal';
import FeedbackSection from './FeedbackSection';
import Footer from './Footer';
import HeroSection from './HeroSection/HeroSection';
import FeaturesSection from './KeyFeaturesSection/FeaturesSection';
import ScrollingFeaturesSection from './ScrollingFeaturesSection';
import SponsorsSection from './SponsorsSection';

const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { loading } = useAuth();
  const onSignIn: AuthModalProps['onSignIn'] = (provider) => {
    localStorage.setItem('visited', 'true');
    setAuthModalOpen(false);
    window.location.href = `${API_URL.server}/auth/login/${provider}`;
  };

  return (
    <>
      <div className="bg-white snap-y snap-mandatory overflow-y-scroll h-screen">
        <header className="absolute top-0">
          <div className="w-44 h-24 flex justify-center items-center">
            <img src={notangles} className="w-12 cursor-pointer" />
            <p className="font-semibold text-lg pl-1 cursor-pointer select-none">Notangles</p>
          </div>
        </header>
        <div className="snap-center h-screen">
          <HeroSection
            openModal={() => {
              setAuthModalOpen(true);
            }}
          />
        </div>
        <div className="snap-center h-screen flex flex-col justify-center items-center">
          <div className="flex pt-20 flex-col items-around justify-around">
            <SponsorsSection />
            <FeaturesSection />
          </div>
        </div>
        <ScrollingFeaturesSection />
        <div className="snap-center h-screen flex flex-col justify-between">
          <FeedbackSection />
          {/* Sticky Footer */}
          <Footer />
        </div>
      </div>
      <AuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
        }}
        loading={loading}
        onSignIn={onSignIn}
      />
    </>
  );
};

export default LandingPage;
