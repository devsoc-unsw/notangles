import { NavigateNext } from '@mui/icons-material';
import notangles from '../../../assets/notangles_1.png';
import { FlipWords } from '../flip-words';

const handleStartClick = () => {
  localStorage.setItem('visited', 'true');
  window.location.href = '/';
};

const HeroSection = () => {
  const words = ['plan', 'create', 'organise', 'optimise', 'design'];

  return (
    <div className="relative min-w-full min-h-screen flex flex-col">
      <div className='flex items-center justify-center h-screen px-4 sm:px-8'>
        <div className='flex flex-col-reverse md:flex-row items-center justify-around w-full max-w-[1200px]'>
          <div className='absolute z-0 mt-[100px] inset-0 blur-xl h-[300]' 
               style={{ background: "linear-gradient(143.6deg, rgba(128, 151, 209, 0) 20.79%, rgba(69, 108, 237, 0.26) 45.92%, rgba(82, 103, 171, 0) 70.35%)" }}>
          </div>
          <div className='flex flex-col justify-center z-10 items-center text-center md:items-start md:text-left w-full md:w-1/2'>
            <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal">
              Intuitively
              <FlipWords words={words} duration={4000} className='text-[#0070f3]' /> <br />
              the perfect UNSW timetable.
            </p>
            <p className='text-lg sm:text-2xl md:text-3xl mt-4 font-sans'>
              Drag and drop your university classes <br /> and events to prepare for a term.
            </p>
            <button 
              className="flex justify-center items-center shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] hover:scale-105 px-6 sm:px-8 py-2 sm:py-3 bg-[#0070f3] rounded-3xl text-white font-light transition duration-200 ease-linear mt-5"
              onClick={handleStartClick}
            >
              <p className='pr-1 ml-2 text-xl sm:text-2xl md:text-3xl font-medium'>Start</p>
              <NavigateNext fontSize='large' />
            </button>
          </div>
          <div className='mt-8 md:mt-0'>
            <img src={notangles} className='w-[250px] sm:w-[350px] md:w-[400px] lg:w-[450px] select-none animate-updown'/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
