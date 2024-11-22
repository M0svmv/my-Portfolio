import Card from "./card";
import SideCard from "./SideCard";

function HideDiv() {
  return (
    <>
      <div className="hide-div d-flex justify-content-center flex-column gap-3 align-items-center">
        <a className="d-flex justify-content-center align-items-center hidden-card position-relative" href="https://drive.google.com/file/d/18_ffdEgHooDPLtbjLEKOCgnqSuY3Nthe/view?usp=sharing">
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
            src="./imgs/MohammedOsama2.jpg"
            className="position-absolute hidden-card-img"
            alt=""
          />
          <p className="hidden-card-text position-absolute text-center text-black">
            Hello, I'm Mohammed Osama, a Front-End Developer.<br />
            Click to Show My CV
          </p>
        </a>
        <div className="text-center written typing">
        Access on a desktop
        I am working on a better experience for this screen <br />

        </div>
      </div>
    </>
  );
}

export default HideDiv;
