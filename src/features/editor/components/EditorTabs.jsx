export default function EditorTabs({ tabs, active, setActive, closeTab }) {
    return (
        <div className="flex bg-gray-800 text-sm">
            {tabs.map((tab) => (
                <div
                    key={tab.path}
                    className={`px-3 py-1 cursor-pointer flex items-center gap-2 ${
                        active === tab.path ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setActive(tab.path)}
                >
                    {tab.name}

                    <span
                        className="text-red-400 ml-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.path);
                        }}
                    >
                        ✕
                    </span>
                </div>
            ))}
        </div>
    );
}
