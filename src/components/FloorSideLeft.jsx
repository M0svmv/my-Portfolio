import "./FloorSide.css";
function FloorSide() {
  return (
    <>
      <div className="d-flex justify-content-end flex-wrap flex-column gap-3 floorSideLeft col-1 floorSide ">
        <div src="" className="col-12 " height={"25%"} alt="" />
        <img
          src="./imgs/deckBack.png"
          className="col-12 "
          height={"25%"}
          alt=""
        />

        <img
          src="./imgs/cardBack.jpg"
          className="col-12"
          height={"25%"}
          alt=""
        />
      </div>
    </>
  );
}

export default FloorSide;
