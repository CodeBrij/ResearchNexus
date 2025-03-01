import { Toaster } from "react-hot-toast";
import IndexPage from "./pages/Index.jsx";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import PlayGroundPage from "./pages/PlaygroundPage.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<IndexPage />} />
      <Route path="/dashboard">
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="/community">
        <Route index element={<Community />} />
      </Route>
      <Route path="/playground">
        <Route index element={<PlayGroundPage />} />
      </Route>
    </Route>
  )
);

function App() {

  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }}/>
      <Toaster />
    </>
  )
}

export default App
