import { useContext, useEffect, useState } from "react";
import { cardsContext } from "../Context/CardsContext";
import TypingEffect from "./TypingEffect";

function SideCard() {
  const { sideCard } = useContext(cardsContext);
  const [currentDesc, setCurrentDesc] = useState("");

  // Update the description when sideCard.desc changes
  useEffect( () => {
    if (sideCard.desc) {async function updateDescription() {
      setCurrentDesc(""); // Clear the current description
      await setTimeout(() => setCurrentDesc(" ."+sideCard.desc+". "), 0); // Add delay before updating
    }
    updateDescription();}
  }, [sideCard.desc]);

  return (
    <>
      <a
        href={sideCard.URL}
        className="sideCard"
        target="_blank"
        rel="noopener noreferrer">
        <img
          width={"100%"}
          src={sideCard.cardImg || "./imgs/cardBack.jpg"}
          className="position-relative"
          alt=""
        />
        <h5 className="side-card-title position-absolute">{sideCard.title}</h5>
        {sideCard.img && (
          <img
            src={sideCard.img}
            className="position-absolute card-img border-0"
            alt=""
          />
        )}
        <p className="side-card-text position-absolute">{sideCard.text}</p>
      </a>
      <br />
      <div className="d-flex description justify-content-center flex-wrap flex-row gap-3">
        {currentDesc && <TypingEffect text={currentDesc} speed={70} />}
      </div>
    </>
  );
}

export default SideCard;
