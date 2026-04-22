// features/properties/PropertiesPanel.jsx
export default function PropertiesPanel() {
    return (
        <div className="p-3 text-sm">
            <h2 className="font-semibold mb-2">Properties</h2>

            <div className="space-y-2">
                <div>
                    <label>Temperature</label>
                    <input className="w-full bg-gray-800 p-1 mt-1" />
                </div>

                <div>
                    <label>Pressure</label>
                    <input className="w-full bg-gray-800 p-1 mt-1" />
                </div>
            </div>
        </div>
    );
}
