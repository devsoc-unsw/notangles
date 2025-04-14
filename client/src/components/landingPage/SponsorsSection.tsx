import arista from '../../assets/sponsors/arista_black.png';
import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import safetyCulture from '../../assets/sponsors/safetyculture_black.png';
import theTradeDesk from '../../assets/sponsors/thetradedesk_black.png';

const SponsorsSection = () => {
  return (
    <div className="flex flex-col h-auto rounded-xl w-full items-center justify-center py-8">
      <p className="text-center md:text-3xl text-4xl font-bold mb-16 md:mb-8">Brought to you by</p>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
        <ul className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          <li>
            <img src={arista} alt="Arista" className="h-11" />
          </li>
          <li>
            <img src={theTradeDesk} alt="theTradeDesk" className="h-11" />
          </li>
          <li>
            <img src={safetyCulture} alt="Safety Culture" className="h-11" />
          </li>
          <li>
            <img src={janeStreet} alt="Jane Street" className="h-11" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SponsorsSection;
