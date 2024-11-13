import AutoTimetable from "../../assets/AutoTimetable.gif"
import PlanAhead from "../../assets/PlanAhead.gif"
import SelectCourse from "../../assets/SelectCourses.gif"

interface FeatureItemProps {
  number: string;
  title: string;
  description: string;
  gif: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ number, title, description, gif }) => (
  <div className="w-full h-screen snap-center min-h-screen flex flex-col-reverse md:flex-row">
    <div className="bg-blue-500 h-1/2 md:h-screen md:w-1/2 flex flex-col items-center justify-center">
      <div className="font-extrabold w-3/4 text-8xl md:text-9xl">
        <p>{number}</p>
      </div>
      <div className="w-3/4 font-bold text-4xl mt-10 mb-6">
        <p>{title}</p>
      </div>
      <div className="w-3/4 text-xl">
        <p>{description}</p>
      </div>
    </div>
    <div className="h-1/2 md:h-screen md:w-1/2 flex justify-center items-center">
      <div className="w-1/2 bg-white rounded-xl flex justify-center items-center">
        <img src={gif} className="w-11/12" />
      </div>
    </div>
  </div>
);

const ScrollingFeaturesSection = () => {
  const features = [
    {
      number: '01',
      title: 'Course Selector',
      description: 'Search and select your desired course and get a general overview of each class, their times and locations, all before the registrations start!',
      gif: SelectCourse
    },
    {
      number: '02',
      title: 'Plan Ahead',
      description: 'Add any course classes or custom events to your calendar, effectively scheduling all your uni commitments!',
      gif: PlanAhead
    },
    {
      number: '03',
      title: 'Auto Timetabling',
      description: 'Struggling to make your ideal timetable? Put in your preferences and we’ll generate one for you!',
      gif: AutoTimetable
    },
  ];

  return (
    <div className="flex flex-col justify-center">
      <div className="flex-col text-blue-50">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default ScrollingFeaturesSection;
