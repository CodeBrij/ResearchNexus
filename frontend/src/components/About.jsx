const About = () => {
    return (
        <div className="flex items-center justify-center pb-10">
            <p className="text-xs lg:text-sm leading-none text-gray-900 dark:text-gray-50">
              &copy; {new Date().getFullYear()} designed by{" "}
              <a href="" className=" text-primary m-auto cursor-pointer text-[17px] flex items-center" rel="nofollow">
                Made with ❤️ by Sunrisers
              </a>
            </p>
        </div>
    );
  };
  export default About;