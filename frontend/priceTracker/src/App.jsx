import { BrowserRouter,Route,Routes } from "react-router-dom"
import Home from "./components/Home"
import { DataProvider } from "./DataContext"
import Navbar from "./components/Navbar"
import Dashboard from "./components/Dashboard"
import AIGen from "./components/AIGen"
import ProductGrid from "./components/ProductGrid"
function App() {


  return (
    <DataProvider>
    <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path ='/generate' element={<AIGen/>}/>
      <Route path ='/all-products' element={<ProductGrid/>}/>
    </Routes>
    </BrowserRouter>
    </DataProvider>
  )
}

export default App
