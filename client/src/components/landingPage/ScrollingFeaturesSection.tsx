interface FeatureItemProps {
  number: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ number, title, description }) => (
  <div className="w-full h-[650px] flex">
    <div className="bg-blue-500 w-1/2 flex flex-col items-center justify-center">
      <div className="font-extrabold w-3/4 text-9xl">
        <p>{number}</p>
      </div>
      <div className="w-3/4 font-bold text-4xl mt-10 mb-6">
        <p>{title}</p>
      </div>
      <div className="w-3/4">
        <p>{description}</p>
      </div>
    </div>
    <div className="w-1/2 bg-blue-100">

    </div>
  </div>
);

const ScrollingFeaturesSection = () => {
  const features = [
    {
      number: '01',
      title: 'Course Selector',
      description: 'Search and select your desired course and get a general overview of each class, their times and locations, all before the registrations start!',
    },
    {
      number: '02',
      title: 'Plan Ahead',
      description: 'Add any course classes or custom events to your calendar, effectively scheduling all your uni commitments!'
    },
    {
      number: '03',
      title: 'Auto Timetabling',
      description: 'Struggling to make your ideal timetable? Put in your preferences and we’ll generate one for you!' },
  ];

  return (
    <div className="flex flex-col justify-center">
      <p className="text-5xl mb-8 text-center font-semibold">How it Works</p>
      <div className="h-[1950px] flex-col text-blue-50">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default ScrollingFeaturesSection;
