import DevSocLogo from '../../assets/devsoc_white.svg'

const Footer = () => {
  return (
    <div className="relative bottom-0 flex justify-center items-center w-full h-[250px] bg-blue-500">
      <div className="flex w-5/6 h-4/5 p-[10px] space-x-3">
        <div className="flex-col w-[670px] p-[5px]">
        <img src={DevSocLogo} alt="Devsoc Logo" />
        <p className="text-white text-sm object-bottom">© 2024 — UNSW Software Development Society</p>
        </div>
        <div className="p-[10px]">
          <p className="text-white">
          DevSoc is the UNSW Software Development Society. We do not represent the School, Faculty, or University. 
          This website seeks to be a centralised platform for students looking for employment opportunities, 
          but its information has not been officially endorsed by the University, Faculty, School, or the 
          Computer Science and Engineering Society. You should confirm with the employer that any information received 
          through this website is correct. <br/>
          <br/>Notangles was made with by CSE students for CSE students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
