export default function EditorTabs({ tabs, active, setActive, closeTab }) {
    return (
        <div className="flex bg-gray-800 text-sm">
            {tabs.map((tab) => (
                <div
                    key={tab.path}
                    className={`px-3 py-1 cursor-pointer flex items-center gap-2 border-r border-gray-700 ${
                        active === tab.path ? "bg-gray-700 text-white" : "text-gray-300"
                    }`}
                    onClick={() => setActive(tab.path)}
                >
                    <span>{tab.name}</span>
                    {tab.dirty ? <span className="text-amber-400">•</span> : null}

                    {tab.closable ? (
                        <span
                            className="flex items-center justify-center w-5 h-5 -mr-2 rounded-full hover:bg-gray-600 hover:text-red-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeTab(tab.path);
                            }}
                        >
                            ✕
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
