import config from "../config/index.json";
import hero_image from "../assets/images/hero_image.png";
const MainHeroImage = () => {
  const { mainHero } = config;
  return (
    <div className="w-4/5 md:w-3/5 lg:w-2/5">
      <img
        className=" object-cover "
        src={hero_image}
        alt="happy team image"
      />
    </div>
  );
};

export default MainHeroImage;