import notangles from '../../../assets/notangles_1.png';
import devsoc from '../../../assets/devsoc.svg';
import janeStreet from '../../../assets/sponsors/jane_street_black.svg';
import tiktok from '../../../assets/sponsors/tiktok_logo_black.svg';
import { MoreHoriz, NavigateNext } from '@mui/icons-material';

const HeroSection = () => {
  return (
    <div className="min-w-full min-h-[1000px] bg-blue-100">
      <header>
        <div className='w-64 h-28 bg-blue-100 flex justify-center items-center'>
          <img src={notangles} className='w-16 cursor-pointer'/>
          <p className='font-semibold text-xl pr-4 cursor-pointer'>Notangles</p>
        </div>
      </header>
      <div className='flex items-center justify-center'>
        <div className='flex items-center justify-around bg-blue-100 w-10/12 max-w-[1600px] min-h-96'>
          <div className='flex-col justify-center items-center text-5xl font-semibold w-[480px]'>
            <p>The timetable solution for all UNSW students.</p>
            <button className='flex justify-center items-center rounded-xl w-32 h-10 mt-10 text-xl bg-blue-500 text-white shadow-lg shadow-gray-400'>
              <p className='pr-1 ml-2'>Start</p>
              <NavigateNext fontSize='medium' />
            </button>
          </div>
          <div>
            <img src={notangles} className='w-[350px]'/>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center mt-44'>
        <div className='flex flex-col text-center items-center font-bold text-3xl'>
          <p>Brought to you by.</p>
          <img src={devsoc} className='h-28 pt-2 pb-2' />
          <MoreHoriz fontSize='large' color='inherit' />
          <p className='mt-8'>Our Sponsors</p>
          <div className='flex pt-6'>
            <img src={janeStreet} className='h-20' />
            <img src={tiktok} className='pl-12 h-20' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

