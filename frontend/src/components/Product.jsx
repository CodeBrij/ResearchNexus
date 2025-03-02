import config from "../config/index.json";
import one from "../assets/images/one.png";
import two from "../assets/images/two.png";
import three from "../assets/images/three.jpg";
import four from "../assets/images/four.jpg";
const Product = () => {
  const { product } = config;
  const [firstItem, secondItem, thirdItem, fourthItem] = product.items;

  return (
    <section className={`bg-background py-8`} id="product">
      <div className={`container w-10/12 mx-auto m-8`}>
        <h1
          className={`w-full my-2 mb-10 text-5xl font-bold leading-tight text-center text-primary`}
        >
          {product.title.split(" ").map((word, index) => (
            <span
              key={index}
              className={index % 2 ? "text-primary" : "text-primary_text"}
            >   
              {word}{" "}
            </span>
          ))}
        </h1>

        {/* First Item */}
        <div className={`flex flex-wrap justify-between mt-10 items-center`}>
          <div className={`w-5/6 sm:w-1/2 p-6`}>
            <h3
              className={`text-3xl text-primary_text font-bold leading-none mb-3 `}
            >
              {firstItem?.title}
            </h3>
            <p className={`text-secondary_text`}>{firstItem?.description}</p>
          </div>
          <div className={`w-full sm:w-1/2 p-6`}>
            <div className="mockup-browser border border-base-300 bg-primary/20">
              <div className="mockup-browser-toolbar"></div>
              <div className="flex justify-center border-t border-base-300">
                <img
                  className=""
                  src={two}
                  alt={firstItem?.title}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second Item */}
        <div
          className={`flex flex-wrap flex-col-reverse sm:flex-row justify-between mt-10 items-center`}
        >
          <div className={`w-full sm:w-1/2 p-6`}>
            <div className="mockup-browser border border-base-300 bg-primary/20">
              <div className="mockup-browser-toolbar"></div>
              <div className="flex justify-center border-t border-base-300">
                <img
                  className=""
                  src={one}
                  alt={secondItem?.title}
                />
              </div>
            </div>
          </div>
          <div className={`w-full sm:w-1/2 p-6`}>
            <h3
              className={`text-3xl text-primary_text font-bold leading-none mb-3`}
            >
              {secondItem?.title}
            </h3>
            <p className={`text-secondary_text mb-8`}>{secondItem?.description}</p>
          </div>
        </div>

        {/* Third Item */}
        <div className={`flex flex-wrap justify-between mt-10 items-center`}>
          <div className={`w-5/6 sm:w-1/2 p-6`}>
            <h3
              className={`text-3xl text-primary_text font-bold leading-none mb-3`}
            >
              {thirdItem?.title}
            </h3>
            <p className={`text-secondary_text`}>{thirdItem?.description}</p>
          </div>
          <div className={`w-full sm:w-1/2 p-6`}>
            <div className="mockup-browser border border-base-300 bg-primary/20">
              <div className="mockup-browser-toolbar"></div>
              <div className="flex justify-center border-t border-base-300">
                <img
                  className=""
                  src={four}
                  alt={thirdItem?.title}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Item */}
        <div className={`flex flex-wrap justify-between mt-10 items-center`}>
        <div className={`w-full sm:w-1/2 p-6`}>
            <div className="mockup-browser border border-base-300 bg-primary/20">
              <div className="mockup-browser-toolbar"></div>
              <div className="flex justify-center border-t border-base-300">
                <img
                  className=""
                  src={three}
                  alt={fourthItem?.title}
                />
              </div>
            </div>
          </div>
          <div className={`w-5/6 sm:w-1/2 p-6`}>
            <h3
              className={`text-3xl text-primary_text font-bold leading-none mb-3`}
            >
              {fourthItem?.title}
            </h3>
            <p className={`text-secondary_text`}>{fourthItem?.description}</p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Product;
