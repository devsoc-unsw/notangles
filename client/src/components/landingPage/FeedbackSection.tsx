interface ButtonProps {
  text: string;
  link: string;
}

const FeedbackButton: React.FC<ButtonProps> = ({text, link}) => (
  <a href={link} className="bg-blue-500 hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] text-white px-4 py-2 rounded-md mt-20 mr-10">
  {text}</a>
);


const FeedbackSection = () => {
  return (
    <div className="flex justify-center items-center mt-60 p-30 w-full h-[450px]">
      <div className="flex-col justify-center text-center pt-20 max-w-[1500px] pb-20 text-black pr-20 pl-20">
        <p className="text-5xl font-semibold mb-10">Interested in Notangles?</p>
        <p className="text-xl">If you're a CSE student with a keen interest in Notangles and looking 
          to get involved, keep an eye out for our recruitment announcements on DevSoc's socials.
          Otherwise, you can also contribute by suggesting cool new features, report any bugs, or even
          make a pull request on the Notangles repo.
        </p>
        <div className="flex justify-center"> 
          <FeedbackButton link="https://forms.gle/rV3QCwjsEbLNyESE6" text="Feedback"/>
          <FeedbackButton link="https://github.com/devsoc-unsw/notangles" text="Github"/>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
