import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import macquarie from '../../assets/sponsors/macquarie_logo_black.svg';
import tiktok from '../../assets/sponsors/tiktok_logo_black.svg';

const SponsorsSection = () => {
  return (
    <div className="flex flex-col h-auto rounded-xl w-full items-center justify-center py-8">
      <p className="text-center md:text-3xl text-4xl font-bold mb-16 md:mb-8">Brought to you by</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
        <ul className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <li>
            <img src={janeStreet} alt="Jane Street" className="h-16" />
          </li>
          <li>
            <img src={macquarie} alt="Macquarie" className="h-16" />
          </li>
          <li>
            <img src={tiktok} alt="TikTok" className="h-16" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SponsorsSection;
