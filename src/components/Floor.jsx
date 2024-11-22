import FloorCards from "./FloorCards";
import FloorSide from "./FloorSideLeft";
import HandCards from "./HandCards";
import OppHandCards from "./OpponentHandCards";
import "./Floor.css";
import FloorSideRight from "./FloorSideRight";
function Floor() {
  return (
    <>
      <div className="d-flex flex-wrap flex-column floor col-9">
      <OppHandCards />

      <div className=" d-flex flex-wrap flex-row col-12 justify-content-center align-items-center">
        <FloorSide key={"floor-side-1"} />
        <div className="col-8 d-flex floorCards flex-wrap flex-row justify-content-center align-items-center">
          <FloorCards key={"floor-cards"} />
          </div>
        <FloorSideRight key={"floor-side-2"} />
      </div>

      <HandCards />
      </div>
      <div className="col-12 free-space">


      </div>
    </>
    
  );
}

export default Floor;
