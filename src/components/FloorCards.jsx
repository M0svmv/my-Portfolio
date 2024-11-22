import CardRow from "./CardRow";


function FloorCards() {
  return (
    <div className="d-flex justify-content-center flex-wrap flex-row floorCards col-10 gap-0">
      <CardRow key={"card-row-1"} />
      
    </div>
  );
}

export default FloorCards;
