import { Routes , Route } from "react-router-dom";
import CharacterListPage from "./pages/CharacterListPage";
import CharacterDetailsPage from "./pages/CharacterDetailsPage";
function App(){
  return(
      <Routes>
        <Route path="/" element={<CharacterListPage/>}/>
        <Route path="/characters/:id" element={<CharacterDetailsPage/>}/>
      </Routes>
  ) 
  ;
}

export default App;