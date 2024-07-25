import notangles from '../../../assets/notangles_1.png';
import { NavigateNext } from '@mui/icons-material';
import { FlipWords } from '../flip-words';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const words = ['plan', 'create', 'design', 'organise', 'optimise'];

  const navigate = useNavigate();
  const routeChange = () => {
    const path = `/`;
    navigate(path);
  }

  return (
    <div className="min-w-full min-h-[1000px] bg-blue-200">
      <header>
        <div className='w-64 h-28 flex justify-center items-center'>
          <img src={notangles} className='w-16 cursor-pointer'/>
          <p className='font-semibold text-xl pr-4 cursor-pointer select-none'>Notangles</p>
        </div>
      </header>
      <div className='flex items-center justify-center'>
        <div className='flex items-center justify-around w-10/12 max-w-[1200px] min-h-96'>
          <div className='flex-col justify-center items-center text-stone-800 text-6xl font-semibold w-[550px]'>
            <p>Intuitively<FlipWords words={words} duration={4000} className='text-blue-500' /> <br />the perfect UNSW timetable.  </p>
            <button className="flex justify-center items-center shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.85)] px-8 py-3 bg-[#0070f3] rounded-3xl text-white font-light transition duration-200 ease-linear mt-5 ml-4" onClick={routeChange}>
              <p className='pr-1 ml-2 text-3xl font-medium'>Start</p>
              <NavigateNext fontSize='large' />
            </button>
          </div>
          <div>
            <img src={notangles} className='w-[350px] animate-updown'/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

