import "./card.css";
import { cardsContext } from "../Context/CardsContext";
import { useContext } from "react";
function Cardplayed({ cardImg, img, title, text, URL,desc }) {
  const { setSideCard } = useContext(cardsContext);

  const handleClick = () => {
    setSideCard({
      cardImg,
      img,
      title,
      text,
      URL,
      desc
    });
  };
  return (<>
    <div className="card-played position-relative" onClick={handleClick} >
      <img width={"100%"} src={cardImg} className="position-relative" alt="" />
      
      <h5 className="card-title-played position-absolute">{ title }</h5>
      {img&&<img src={img} className="position-absolute card-img-played" alt="" />}
      <p className="card-text-played position-absolute">{ text }</p>
        
      
    </div>
  </>);
}

export default Cardplayed;