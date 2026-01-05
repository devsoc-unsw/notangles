import airwallex from '../../assets/sponsors/airwallex.avif';
import arista from '../../assets/sponsors/arista_black.png';
import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import lyra from '../../assets/sponsors/lyra_black.svg';
import theTradeDesk from '../../assets/sponsors/thetradedesk_black.png';

const SponsorsSection = () => {
  return (
    <div className="flex flex-col h-auto rounded-xl w-full items-center justify-center py-16">
      <p className="text-center md:text-3xl text-4xl font-bold mb-16 md:mb-8">Brought to you by</p>
      <ul className="grid grid-cols-1 md:grid-cols-[repeat(3,_minmax(100px,_1fr))] gap-y-8 place-items-center">
        <li>
          <img src={janeStreet} alt="Jane Street" className="h-11" />
        </li>
        <li>
          <img src={theTradeDesk} alt="theTradeDesk" className="h-9" />
        </li>
        <li>
          <img src={lyra} alt="Lyra" className="h-13" />
        </li>
        <li className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 place-items-center gap-y-8">
          <img src={airwallex} alt="Airwallex" className="h-9" />
          <img src={arista} alt="Arista" className="h-8" />
        </li>
      </ul>
    </div>
  );
};

export default SponsorsSection;
