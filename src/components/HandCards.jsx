import Card from "./card";
import "./HandCards.css";
import { cardsContext } from "../Context/CardsContext";
import { useContext } from "react";
function HandCards() {
  const { cards } = useContext(cardsContext);
  return (
    <>
      <div className="d-flex justify-content-center flex-wrap flex-row gap-3 handCards ">
        {cards.map((card) => (
          <Card
            key={card.title}
            cardImg={card.cardImg}
            img={card.img}
            title={card.title}
            text={card.text}
            desc = {card.desc}
            handleCards = {card.handleCards}
          />
        ))}
      </div>
    </>
  );
}

export default HandCards;
