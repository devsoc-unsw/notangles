import janeStreet from '../../assets/sponsors/jane_street_black.svg';
import macquarie from '../../assets/sponsors/macquarie_logo_black.svg';
import tiktok from '../../assets/sponsors/tiktok_logo_black.svg';

const SponsorsSection = () => {
  return (
    <div className='flex flex-col h-[200px] rounded-xl w-full items-center justify-center'>
      <p className='text-center text-4xl font-bold mb-14'>Brought to you by</p>
      <div className='inline-flex flex-nowrap h-[300px]'>
        <ul className='flex items-center justify-center md:justify-start'>
          <li>
            <img src={janeStreet} alt='Jane Street' className='h-16' />
          </li>
          <li>
            <img src={macquarie} alt='Macquarie' className='pl-12 h-16' />
          </li>
          <li>
            <img src={tiktok} alt='TikTok' className='pl-12 h-16' />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SponsorsSection;

