import keyFeatures from '../../../assets/blobFeaturesBackground.svg';
import dragIcon from '../../../assets/dragIcon.png';
import S from './styles';

const FeaturesSection = () => {
  return (
    <div className="flex justify-center items-center min-w-full min-h-[550px] bg-blue-100 mt-[200px]">
      <div className="flex-col justify-center items-between text-5xl w-[800px] font-semibold text-neutral-50">
        <p className="text-center text-[#0070f3]">Introducing our Features</p>
        <div className="flex items-center justify-around min-h-40 mt-16 mb-[200px] gap-[30px]" >
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[35px] px-[25px] rounded-xl hover:drop-shadow-2xl">
          <div className="flex justify-center rounded-[10px] bg-[#B0C0DE] align-center h-[65px] w-[65px] mb-[5px]">
          <img src={dragIcon} className="object-contain" width={50} height={50} />
          </div>
          <p className="text-xl text-[#5373B8] font-bold my-2">Drag N' Drop</p>
          <hr className="w-4/5 h-5 fill-[#5373B8] rounded-l">
          </hr>
          <p className="text-left text-gray-500 text-sm font-light">
            Drag and drop functionality to make planning an intuitive and easy process
          </p>
        </div>
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[35px] px-[25px] rounded-xl hover:drop-shadow-2xl">
          <div className="flex justify-center rounded-[10px] bg-[#B0C0DE] align-center h-[65px] w-[65px] mb-[5px]">
          <img src={dragIcon} className="object-contain" width={50} height={50} />
          </div>
          <p className="text-xl text-[#5373B8] font-bold my-2">Add Friends</p>
          <hr className="w-4/5 h-5 fill-[#5373B8] rounded-l">
          </hr>
          <p className="text-left text-gray-500 text-sm font-light">
            Easily coordinate your schedules with friends to plan and attend classes together
          </p>
        </div>
        <div className="transition duration-200 bg-white w-[250px] h-[250px] py-[35px] px-[25px] rounded-xl hover:drop-shadow-2xl">
          <div className="flex justify-center rounded-[10px] bg-[#B0C0DE] align-center h-[65px] w-[65px] mb-[5px]">
          <img src={dragIcon} className="object-contain" width={50} height={50} />
          </div>
          <p className="text-xl text-[#5373B8] font-bold my-2">Plan Ahead</p>
          <hr className="w-4/5 h-5 fill-[#5373B8] rounded-l">
          </hr>
          <p className="text-left text-gray-500 text-sm font-light">
            Plan in advance to secure your preferred classes and avoid conflicts
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;



// {/* <div className="flex items-center justify-around min-h-40 mt-16" >
//         {/* <img 
//           src={keyFeatures}
//           // className="w-full absolute transform -translate-x-1/2 -translate-y-1/2 top-[65%] left-1/2 md:top-1/2"
//         /> */}
//         <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
//         <div>
//         </div>
//         <p className="text-2xl text-neutral-800">Drag N' Drop</p>
//       </div>
//       <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
//         <div>
//         </div>
//         <p>Add Friends</p>
//       </div>
//       <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
//         <div>
//         </div>
//         <p>Plan Ahead</p>
//       </div>
//     </div> */}
