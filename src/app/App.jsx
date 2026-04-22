// app/App.jsx
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes.jsx";

const router = createMemoryRouter(routes);
export default function App() {
    return <RouterProvider router={router} />;
}
