import keyFeatures from '../../../assets/blobFeaturesBackground.svg';
import calendarIcon from '../../../assets/calendarIcon.png';
import dragIcon from '../../../assets/dragIcon.png';
import peopleIcon from '../../../assets/peopleIcon.png';

const FeaturesSection = () => {
  return (
    <div className="flex justify-center items-center min-w-full min-h-[550px] bg-blue-100 mt-[200px]">
      <div className="flex-col justify-center items-between text-5xl w-[800px] font-semibold text-neutral-50">
        <p className="text-center text-[#0070f3]">Introducing our Features</p>
        <div className="flex items-center justify-around min-h-40 mt-16 mb-[200px] gap-[30px]" >
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[25px] px-[25px] rounded-xl hover:drop-shadow-2xl shadow-lg">
          <div className="flex justify-center rounded-[10px] bg-[#B0C0DE] align-center h-[65px] w-[65px]">
          <img src={dragIcon} className="object-contain" width={50} height={50} />
          </div>
          <p className="text-2xl text-[#5373B8] font-bold my-2.5">Drag N' Drop</p>
          <div className="w-4/5 h-[5px] bg-[#5373B8] rounded-md">
          </div>
          <p className="text-left text-gray-500 text-sm font-light my-3">
            Drag and drop functionality to make planning an intuitive and easy process
          </p>
        </div>
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[25px] px-[25px] rounded-xl hover:drop-shadow-2xl shadow-lg">
          <div className="flex justify-center rounded-[10px] bg-[#70c49c] align-center h-[65px] w-[65px]">
          <img src={peopleIcon} className="object-contain" width={45} height={50} />
          </div>
          <p className="text-2xl text-[#53b887] font-bold my-2.5">Add Friends</p>
          <div className="w-4/5 h-[5px] bg-[#3f916a] rounded-md">
          </div>
          <p className="text-left text-gray-500 text-sm font-light my-3">
            Easily coordinate your schedules with friends to plan and attend classes together
          </p>
        </div>
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[25px] px-[25px] rounded-xl hover:drop-shadow-2xl shadow-lg">
          <div className="flex justify-center rounded-[10px] bg-[#a96f92] align-center h-[65px] w-[65px]">
          <img src={calendarIcon} className="object-contain" width={50} height={50} />
          </div>
          <p className="text-2xl text-[#b75391] font-bold my-2.5">Plan Ahead</p>
          <div className="w-4/5 h-[5px] bg-[#964274] rounded-md">
          </div>
          <p className="text-left text-gray-500 text-sm font-light my-3">
            Plan in advance to secure your preferred classes and avoid conflicts
          </p>
          
        </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;