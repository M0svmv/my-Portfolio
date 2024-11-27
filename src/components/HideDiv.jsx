import TypingEffect from "./TypingEffect";
import CardSwiper from "./CardSwiper";

function HideDiv() {
  return (
    <>
      <div className="hide-div d-flex justify-content-center flex-column gap-3 align-items-center pt-5">
        <CardSwiper className="" />

        <div className="text-center written typing  position-relative">
          <TypingEffect
            text={"S wipe the cards to start playing. Click any card"}
            speed={40}
            className="cardBottom"
          />
        </div>

        {/* Social Connect Icons */}
        <div className="social-icons d-flex justify-content-center gap-4 mt-2">
          <a
            href="https://www.linkedin.com/in/mohamed-osama3000/"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
              alt="LinkedIn"
            />
          </a>
          <a
            href="https://github.com/m0svmv"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="GitHub"
            />
          </a>
          <a
            href="mailto:medoosama822@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Gmail"
            />
          </a>
          <a
            href="https://www.facebook.com/MOsvmv17"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle">
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
              alt="Facebook"
            />
          </a>
        </div>
      </div>
    </>
  );
}

export default HideDiv;
