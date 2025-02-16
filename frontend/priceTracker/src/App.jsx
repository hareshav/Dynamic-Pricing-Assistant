import { BrowserRouter,Route,Routes } from "react-router-dom"
import Home from "./components/Home"
import { DataProvider } from "./DataContext"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
function App() {


  return (
    <DataProvider>
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
    </BrowserRouter>
    </DataProvider>
  )
}

export default App
