import notangles from '../../../assets/notangles_1.png';
import { NavigateNext } from '@mui/icons-material';
import { FlipWords } from '../flip-words';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const words = ['plan', 'create', 'organise', 'optimise', 'design'];

  const navigate = useNavigate();
  const routeChange = () => {
    const path = `/`;
    navigate(path);
  }

  return (
    <div className="min-w-full min-h-[650px] bg-blue-100">
      <header>
        <div className='w-44 h-24 flex justify-center items-center'>
          <img src={notangles} className='w-12 cursor-pointer'/>
          <p className='font-semibold text-lg pl-1 cursor-pointer select-none'>Notangles</p>
        </div>
      </header>
      <div className='flex items-center justify-center mt-12'>
        <div className='flex items-center justify-around w-10/12 max-w-[1000px] min-h-96'>
          <div className='flex-col justify-center items-center text-6xl font-normal w-[600px]'>
            <p>Intuitively<FlipWords words={words} duration={4000} className='text-[#0070f3]' /> <br />the perfect UNSW timetable.</p>
            <p className='text-2xl mt-4 font-sans'>Drag and drop your university classes <br /> and events to prepare for a term.</p>
            <button className="flex justify-center items-center shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-8 py-3 bg-[#0070f3] rounded-3xl text-white font-light transition duration-200 ease-linear mt-5 ml-4" onClick={routeChange}>
              <p className='pr-1 ml-2 text-3xl font-medium'>Start</p>
              <NavigateNext fontSize='large' />
            </button>
          </div>
          <div>
            <img src={notangles} className='w-[380px] shadlow-lg shadow-gray-400 animate-updown'/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

