import Card from "./card";
import "./OpponentHandCard.css";

function OppHandCards() {
  return (<>
    <div className="d-flex justify-content-center flex-wrap align-items-center  mx-auto flex-row gap-3  col-8">
      <Card cardImg="./imgs/cardBack.jpg" />
      <Card cardImg="./imgs/cardBack.jpg" />
      <Card cardImg="./imgs/cardBack.jpg" />
      <Card cardImg="./imgs/cardBack.jpg" />
    </div>
  </>);
}

export default OppHandCards;