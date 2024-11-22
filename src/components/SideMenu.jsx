
import { useContext } from "react";
import { cardsContext } from "../Context/CardsContext";
import SideCard from "./SideCard";
import { Link } from "react-router-dom";
import "./SideMenu.css";

function SideMenu() {
  const { sideCard } = useContext(cardsContext);
  return (<div className="SideMenu col-3 d-flex flex-column align-items-center">
    <SideCard />
    
  </div>);
}

export default SideMenu;