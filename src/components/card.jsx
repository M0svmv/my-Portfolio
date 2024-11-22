import "./card.css";
import { cardsContext } from "../Context/CardsContext";
import { useContext } from "react";
function Card({ cardImg, img, title, text,desc ,handleCards }) {
  const { setSideCard } = useContext(cardsContext);

  const handleClick = () => {
    setSideCard({
      cardImg,
      img,
      title,
      text,
      desc
    });
    if (handleCards) {
      handleCards();
    }
  };
  return (
    <>
      <div className="card" onClick={handleClick}>
        <img
          width={"100%"}
          src={cardImg}
          className="position-relative"
          alt=""
        />

        <h5 className="card-title position-absolute">{title}</h5>
        {img && <img src={img} className="position-absolute card-img" alt="" />}
        <p className="card-text position-absolute">{text}</p>
      </div>
    </>
  );
}

export default Card;
