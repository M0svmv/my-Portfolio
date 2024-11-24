import { useContext } from "react";
import { cardsContext } from "../Context/CardsContext";

function HideDiv() {
  const { profile } = useContext(cardsContext);
  return (
    <>
      <div className="hide-div d-flex justify-content-center flex-column gap-3 align-items-center">
        <a
          className="d-flex justify-content-center align-items-center hidden-card position-relative"
          href="https://drive.google.com/file/d/18_ffdEgHooDPLtbjLEKOCgnqSuY3Nthe/view?usp=sharing"
        >
          <img
            width={"100%"}
            src="./imgs/card1.jpg"
            className="position-relative"
            alt=""
          />
          <h5 className="hidden-card-title position-absolute">
            Mohammed Osama
          </h5>
          <img
            src={profile}
            className="position-absolute hidden-card-img"
            alt=""
          />
          <p className="hidden-card-text position-absolute text-center text-black">
            Hello, I'm Mohammed Osama, a Front-End Developer.<br />
            Click to Show My CV
          </p>
        </a>
        <div className="text-center written typing">
          Access on a desktop <br />
          I am working on a better experience for this screen <br />
        </div>

        {/* Social Connect Icons */}
        <div className="social-icons d-flex justify-content-center gap-4 mt-4">
          <a
            href="https://www.linkedin.com/in/mohamed-osama3000/"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
              alt="LinkedIn"
            />
          </a>
          <a
            href="https://github.com/m0svmv"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
              alt="GitHub"
            />
          </a>
          <a
            href="mailto:medoosama822@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Gmail"
            />
          </a>
          <a
            href="https://www.facebook.com/MOsvmv17"
            target="_blank"
            rel="noopener noreferrer"
            className="icon-circle"
          >
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
