import blobImage from '../../../assets/blobImage.svg';
import calendarIcon from '../../../assets/calendarIcon.png';
import dragIcon from '../../../assets/dragIcon.png';
import peopleIcon from '../../../assets/peopleIcon.png';

interface FeatureBlockProps {
  bgCol: string;
  textCol: string;
  lineCol: string;
  title: string;
  desc: string;
  icon: string;
};

const FeatureBlock: React.FC<FeatureBlockProps> = ({ bgCol, textCol, lineCol, title, desc, icon }) => (
  <div className="transition duration-200 hover:scale-105 bg-white w-[250px] h-[250px] py-[25px] px-[25px] rounded-xl hover:drop-shadow-2xl shadow-lg z-10">
    <div className={`flex justify-center rounded-[10px] ${bgCol} align-center h-[65px] w-[65px]`}>
      <img src={icon} className="object-contain" width={50} height={50} />
    </div>
    <p className={`text-xl md:2xl ${textCol} font-bold my-2.5`}>{title}</p>
    <div className={`w-4/5 h-[5px] ${lineCol} rounded-md`}></div>
    <p className="text-left text-gray-500 text-sm font-light my-3">
      {desc}
    </p>
  </div>
);

const FeaturesSection = () => {
  const features = [
    {
      bgCol: 'bg-[#B0C0DE]',
      textCol: 'text-[#5373B8]',
      lineCol: 'bg-[#5373B8]',
      title: 'Drag N\' Drop',
      desc: 'Drag and drop functionality to make planning an intuitive and easy process',
      icon: dragIcon
    },
    {
      bgCol: 'bg-[#70C49C]',
      textCol: 'text-[#53B887]',
      lineCol: 'bg-[#3F916A]',
      title: 'Add Friends',
      desc: 'Easily coordinate your schedules with friends to plan and attend classes together',
      icon: peopleIcon
    },
    {
      bgCol: 'bg-[#A96F92]',
      textCol: 'text-[#B75391]',
      lineCol: 'bg-[#964274]',
      title: 'Plan Ahead',
      desc: 'Plan in advance to secure your preferred classes and avoid conflicts',
      icon: calendarIcon
    }
  ];
  return (
    <div className="relative justify-center hidden md:flex items-center min-w-full min-h-[300px]">
      {/* Background blob image */}
      <img src={blobImage} className="absolute w-[1000px] z-0" />
      
      {/* Feature Content */}
      <div className="flex-col justify-center items-between text-2xl md:text-4xl h-[500px] w-[800px] font-semibold text-neutral-50 mt-[40px]">
        <p className="text-center text-black">Introducing our Features</p>
        <div className="flex flex-col md:flex-row items-center justify-around min-h-40 mt-[50px] mb-[40px] gap-[30px]">
          {features.map((feature, index) => (
            <FeatureBlock key={index} {...feature}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
