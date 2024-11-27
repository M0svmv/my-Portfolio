import "./Character.css";
import TypingEffect from "./TypingEffect";

function Character() {
  
  const handleClick = () => {
    document.querySelector(".Character").style.display = "none";
  }
  return (
    <>
      <div className="Character" onClick={handleClick} >
        <img src="./imgs/Character.png" alt="character" />
        <div className="text text-center position-absolute top-0">
          <TypingEffect
            text={
              "W elcome to my portfolio!!. I'm Mohamed Osama, a front-end developer. Click anywhere to dismiss this screen, and choose any card to start playing!!"
            }
            speed={70}
          />

        </div>
      </div>
    </>
  );
}

export default Character;
