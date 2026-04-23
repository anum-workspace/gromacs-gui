// app/routes.jsx
import { createRoutesFromElements, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";

export const routes = createRoutesFromElements(<Route path="/" element={<MainLayout />} />);
