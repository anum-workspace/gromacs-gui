// app/routes.jsx
import { createRoutesFromElements, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import SimulationDashboard from "../features/simulation/pages/SimulationDashboard.jsx";

export const routes = createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
        <Route index element={<SimulationDashboard />} />
    </Route>,
);
