interface ButtonProps {
  text: string;
  link: string;
}

const FeedbackButton: React.FC<ButtonProps> = ({ text, link }) => (
  <a
    href={link}
    className="bg-blue-500 hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] text-white px-4 py-2 rounded-md"
  >
    {text}
  </a>
);

const FeedbackSection = () => {
  return (
    <div className="flex justify-center items-center px-6 py-12 w-full h-3/4">
      <div className="flex flex-col justify-center text-center max-w-[800px] sm:max-w-[1200px] lg:max-w-[1500px] text-black space-y-6 sm:space-y-10 px-4 sm:px-20">
        <p className="text-3xl sm:text-5xl font-semibold mb-4 sm:mb-10">
          Interested in Notangles?
        </p>
        <p className="text-lg sm:text-xl">
          If you're a CSE student with a keen interest in Notangles and looking
          to get involved, keep an eye out for our recruitment announcements on
          DevSoc's socials. Otherwise, you can also contribute by suggesting
          cool new features, reporting any bugs, or even making a pull request
          on the Notangles repo.
        </p>
        <div className="flex flex-row items-center justify-center gap-4 md:gap-10">
          <FeedbackButton
            link="https://forms.gle/rV3QCwjsEbLNyESE6"
            text="Feedback"
          />
          <FeedbackButton
            link="https://github.com/devsoc-unsw/notangles"
            text="Github"
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
