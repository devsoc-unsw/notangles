import airwallex from '../../assets/sponsors/airwallex_black.png';
import arista from '../../assets/sponsors/arista_black.png';
import atlassian from '../../assets/sponsors/atlassian.png';
import hrt from '../../assets/sponsors/hrt.png';
import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import lyra from '../../assets/sponsors/lyra_black.svg';
import qrt from '../../assets/sponsors/qrt_black.svg';
import theTradeDesk from '../../assets/sponsors/thetradedesk_black.png';
import citadel from '../../assets/sponsors/citadel.png';
import januaryCapital from '../../assets/sponsors/januarycapital_black.png';
import imc from '../../assets/sponsors/imc.png';
import optiver from '../../assets/sponsors/optiver_black.png';
import recordpoint from '../../assets/sponsors/recordpoint_black.png';

const SponsorsSection = () => {
  return (
    <div className="flex flex-col h-auto rounded-xl w-full items-center justify-center py-16">
      <p className="text-center md:text-3xl text-4xl font-bold mb-16 md:mb-8">Brought to you by</p>
      <ul className="grid grid-cols-1 md:grid-cols-[repeat(4,_minmax(100px,_1fr))] gap-y-8 place-items-center">
        <li>
          <img src={hrt} alt="Hudson River Trading" className="h-12" />
        </li>
        <li>
          <img src={janeStreet} alt="Jane Street" className="h-11" />
        </li>
        <li>
          <img src={theTradeDesk} alt="theTradeDesk" className="h-9" />
        </li>
        <li>
          <img src={lyra} alt="Lyra" className="h-13" />
        </li>
        <li className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 place-items-center gap-y-8">
          <img src={airwallex} alt="Airwallex" className="h-7" />
          <img src={arista} alt="Arista" className="h-6" />
          <img src={atlassian} alt="Atlassian" className="h-6" />
          <img src={qrt} alt="QRT" className="h-6" />
        </li>
        <li className="md:col-span-4 grid grid-cols-3 md:grid-cols-3 place-items-center gap-y-8">
          <img src={citadel} alt="Citadel Securities" className="h-8 invert" />
          <img src={imc} alt="IMC Trading" className="h-7 invert" />
          <img src={januaryCapital} alt="January Capital" className="h-7" />
          <img src={optiver} alt="Optiver" className="h-6" />
          <img src={recordpoint} alt="Recordpoint" className="h-7" />
        </li>
      </ul>
    </div>
  );
};

export default SponsorsSection;
