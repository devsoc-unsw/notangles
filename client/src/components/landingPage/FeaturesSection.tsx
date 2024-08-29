import keyFeatures from '../../assets/blobFeaturesBackground.svg';

const FeaturesSection = () => {
  return (
    <div className="flex justify-center items-center min-w-full min-h-[550px] bg-blue-100">
      <div className="flex-col justify-center items-between text-5xl w-[800px] font-semibold text-neutral-50">
        <p className="text-center text-[#0070f3]">Introducing our Features</p>
        
        <div className="flex items-center justify-around min-h-40 mt-16" >
        <img 
          src={keyFeatures}
          // className="w-full absolute transform -translate-x-1/2 -translate-y-1/2 top-[65%] left-1/2 md:top-1/2"
        />
          <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
            <div>
            </div>
            <p className="text-2xl text-neutral-800">Drag N' Drop</p>
          </div>
          <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
            <div>
            </div>
            <p>Add Friends</p>
          </div>
          <div className="transition duration-200 bg-white w-52 h-56 rounded-xl hover:drop-shadow-2xl">
            <div>
            </div>
            <p>Plan Ahead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;


