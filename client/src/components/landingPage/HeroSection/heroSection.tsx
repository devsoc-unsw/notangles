import { NavigateNext } from '@mui/icons-material';
import notangles from '../../../assets/notangles_1.png';
import { FlipWords } from '../flip-words';
// import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const words = ['plan', 'create', 'organise', 'optimise', 'design'];

  // const navigate = useNavigate();
  // const routeChange = () => {
  //   const path = `/`;
  //   navigate(path);
  // }

  return (
    <div className="relative min-w-full min-h-screen flex flex-col">
      <div className='flex items-center justify-center h-screen'>
        <div className='flex items-center justify-around w-10/12 max-w-[1200px]'>
          <div className='absolute z-0 mt-[100px] inset-0 blur-xl h-[300]' style={{ background: "linear-gradient(143.6deg, rgba(128, 151, 209, 0) 20.79%, rgba(69, 108, 237, 0.26) 45.92%, rgba(82, 103, 171, 0) 70.35%)" }}>
          </div>
          <div className='flex-col justify-center z-10 items-center text-7xl font-normal w-[800px]'>
            <p>Intuitively<FlipWords words={words} duration={4000} className='text-[#0070f3]' /> <br />the perfect UNSW timetable.</p>
            <p className='text-3xl mt-4 font-sans'>Drag and drop your university classes <br /> and events to prepare for a term.</p>
            <button className="flex justify-center items-center shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-8 py-3 bg-[#0070f3] rounded-3xl text-white font-light transition duration-200 ease-linear mt-5 ml-4" onClick={event => window.location.href='/'}>
            {/*TODO: Really bad redirect practise fix later please.*/}
              <p className='pr-1 ml-2 text-3xl font-medium'>Start</p>
              <NavigateNext fontSize='large' />
            </button>
          </div>
          <div>
            <img src={notangles} className='w-[450px] shadlow-lg shadow-gray-400 animate-updown'/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
