// features/simulation/pages/SimulationDashboard.jsx
export default function SimulationDashboard() {
    return (
        <div className="p-4">
            <h1 className="text-lg font-semibold mb-4">Simulation Dashboard</h1>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded">Simulation A</div>
                <div className="bg-gray-800 p-4 rounded">Simulation B</div>
            </div>
        </div>
    );
}
