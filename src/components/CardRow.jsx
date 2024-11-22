import CardSpace from "./CardSpace";
import "./CardRow.css";
import { useContext } from "react";
import { cardsContext } from "../Context/CardsContext";

function CardRow() {
  const { cardPlayed } = useContext(cardsContext);

  // Ensure cardPlayed has at least 21 elements
  const paddedCards = [...cardPlayed];
  while (paddedCards.length < 20) {
    paddedCards.push({}); // Add empty objects to pad the array
  }

  return (
    <div className="d-flex justify-content-center flex-wrap flex-row cardRow">
      {paddedCards.map((skill, index) =>
        index === 10 ? (
          <>
            {/* Unique key for the space-div */}
            <div key={`space-div-${index}`} className="space-div"></div>
            <CardSpace
              key={`card-${index}`}
              cardImg={skill.cardImg}
              img={skill.img}
              title={skill.title}
              text={skill.text}
              URL={skill.URL}
              desc={skill.desc}
            />
          </>
        ) : (
          <CardSpace
            key={`card-${index}`}
            cardImg={skill.cardImg}
            img={skill.img}
            title={skill.title}
            text={skill.text}
            URL={skill.URL}
            desc={skill.desc}
          />
        )
      )}
    </div>
  );
}

export default CardRow;
