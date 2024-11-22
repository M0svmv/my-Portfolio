import "./App.css";
import SideMenu from "./components/SideMenu";
import Floor from "./components/Floor";
import Character from "./components/Character";
import HideDiv from "./components/HideDiv";

function App() {
  return (
    <div className="App d-flex flex-wrap flex-row position-relative">
      <Character />
      
      <SideMenu />
      <Floor />
      
    <HideDiv />
    </div>
  );
}

export default App;
