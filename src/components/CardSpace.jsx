
import CardPlayed from "./CardPLayed";
import "./CardSpace.css";
function CardSpace({ cardImg, img, title, text,URL,desc }) {
  return (
    <div className="d-flex justify-content-center align-items-center square-div">
      <div className="d-flex justify-content-center align-items-center">
        {title&&<CardPlayed
          key={title}
          width={"70%"}
          cardImg={cardImg}
          img={img}
          title={title}
          text={text}
          URL={URL}
          desc={desc}
        />}
      </div>
    </div>
  );
}

export default CardSpace;
