import devsoc from '../../assets/devsoc.svg';
import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import macquarie from '../../assets/sponsors/macquarie_logo_black.svg';
import tiktok from '../../assets/sponsors/tiktok_logo_black.svg';

const SponsorsSection = () => {
  return (
    <div className='flex items-center justify-center mt-00'>
      <div className='flex flex-col text-center items-center font-bold text-3xl'>
        <p>Brought to you by</p>
        <img src={devsoc} className='h-24 pt-2 pb-2' />
        <p className='mt-2'>Our Sponsors</p>
        <div className='flex pt-6'>
          <img src={janeStreet} className='h-16' />
          <img src={tiktok} className='pl-12 h-16' />
          <img src={macquarie} className='pl-12 h-16' />
        </div>
      </div>
    </div>
  );
};

export default SponsorsSection;

