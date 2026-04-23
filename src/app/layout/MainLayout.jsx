// app/layout/MainLayout.jsx
import Navbar from "../../features/navbar/Navbar.jsx";
import ExplorerPanel from "../../features/explorer/components/ExplorerPanel.jsx";
import TerminalPanel from "../../features/terminal/TerminalPanel.jsx";
import PropertiesPanel from "../../features/properties/PropertiesPanel.jsx";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useExplorerStore } from "../../features/explorer/store/explorerStore.js";
import EditorTabs from "../../features/editor/components/EditorTabs.jsx";
import CodeEditor from "../../features/editor/components/CodeEditor.jsx";
import SimulationDashboard from "../../features/simulation/pages/SimulationDashboard.jsx";
import { HOME_TAB_ID, useEditorStore } from "../../features/editor/store/editorStore.js";
import { useEffect } from "react";

export default function MainLayout() {
    const { rootPath } = useExplorerStore();
    const tabs = useEditorStore((state) => state.tabs);
    const active = useEditorStore((state) => state.active);
    const setActive = useEditorStore((state) => state.setActive);
    const closeTab = useEditorStore((state) => state.closeTab);
    const updateTabContent = useEditorStore((state) => state.updateTabContent);
    const saveTab = useEditorStore((state) => state.saveTab);
    const activeTab = tabs.find((tab) => tab.path === active);

    useEffect(() => {
        if (!activeTab?.dirty || activeTab.path === HOME_TAB_ID) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void saveTab(activeTab.path);
        }, 600);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [activeTab?.content, activeTab?.dirty, activeTab?.path, saveTab]);

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            {/* Navbar */}
            <div className="h-8 border-b border-gray-700">
                <Navbar />
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                <Group className="h-full w-full" orientation="horizontal">
                    {/* Left Explorer */}
                    <Panel collapsible defaultSize="15%">
                        <ExplorerPanel rootPath={rootPath} />
                    </Panel>

                    <Separator className="border-r border-gray-700" />

                    {/* Center */}
                    <Panel minSize={300}>
                        <Group orientation="vertical">
                            {/* Main View */}
                            <Panel defaultSize="70%">
                                <div className="flex h-full flex-col overflow-hidden">
                                    <EditorTabs
                                        tabs={tabs}
                                        active={active}
                                        setActive={setActive}
                                        closeTab={closeTab}
                                    />
                                    <div className="min-h-0 flex-1 overflow-hidden">
                                        {active === HOME_TAB_ID ? (
                                            <SimulationDashboard />
                                        ) : (
                                            <CodeEditor
                                                tab={activeTab}
                                                onChange={(content) =>
                                                    updateTabContent(active, content)
                                                }
                                                onSave={() => saveTab(active)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Panel>

                            <Separator className="border-b border-gray-700" />

                            {/* Terminal */}
                            <Panel collapsible defaultSize="30%">
                                <div className="h-full overflow-hidden bg-gray-950">
                                    <TerminalPanel />
                                </div>
                            </Panel>
                        </Group>
                    </Panel>

                    <Separator className="border-r border-gray-700" />

                    {/* Right Properties */}
                    <Panel collapsible defaultSize="15%">
                        <PropertiesPanel />
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
