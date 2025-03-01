import { Toaster } from "react-hot-toast";
import IndexPage from "./pages/Index.jsx";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import PlayGroundPage from "./pages/PlaygroundPage.jsx";
import AnalyzedFilesPage from "./pages/AnalyzedFilesPage.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<IndexPage />} />
      <Route path="playground" element={<PlayGroundPage />} />
      <Route path="dashboard" element={<AnalyzedFilesPage />} />
    </Route>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <Toaster />
    </>
  );
}

export default App;
