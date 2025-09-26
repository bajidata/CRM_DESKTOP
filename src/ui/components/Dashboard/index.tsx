import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { Database } from "lucide-react";
import { auth } from "../../firebase";
import LoaderModal from "../Loader";
import VpnPopup from "../VpnPopup";
import CredPopup from "../CredPopup-notused";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AsanaSqlLab } from "../Dashboard/DashboardTabs/SqlLab/AsanaSqlLab";
import { ProfilePanel } from "../Dashboard/DashboardTabs/ProfilePanel";
import type {
  DashboardProps,
  CrendentialInfo,
  VpnInfo,
  TabConfig,
} from "../types/index";

const tabNames: TabConfig = {
  sql: { label: "SQL Lab", icon: <Database size={18} /> },
  // profile: { label: "Profile", icon: <User size={18} /> },
};

export const Dashboard: React.FC<DashboardProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState("sql");
  const [loading, setLoading] = useState(false);
  const [showVpn, setShowVpn] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showVpnInfo] = useState<VpnInfo>({ title: "", text: "" });
  const [credential, setCredential] = useState<CrendentialInfo>({
    visible: false,
    username: "",
    password: "",
  });

  const [projects, setProjects] = useState<{ gid: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await window.electron?.getAsanaProjects();
        if (res?.success && res.projects) {
          setProjects(res.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentials = async () => {
    const credRes = await window.electron?.getCredentials();
    setCredential({
      visible: true,
      username: credRes?.credentials?.username || "",
      password: credRes?.credentials?.password || "",
    });
  };

  const handleSaveCreds = async (username: string, password: string) => {
    const saveRes = await window.electron?.saveCredentials({
      username,
      password,
    });
    if (saveRes?.success) {
      setCredential({ visible: false, username, password });
    } else {
      alert("Can't Save your credentials...");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "sql":
        return (
          <AsanaSqlLab
            user={user}
            isRequesting={isRequesting}
            setIsRequesting={setIsRequesting}
            onCredentials={handleCredentials}
            selectedProject={selectedProject} // 🔥 send gid here
          />
        );
      case "profile":
        return <ProfilePanel user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        isRequesting={isRequesting}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabNames={tabNames}
        projects={projects}
        selectedProject={selectedProject} // new
        setSelectedProject={setSelectedProject} // new
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <Header user={user} tabNames={tabNames} activeTab={activeTab} />

        <main className="flex-1 p-2 flex flex-col">
          {renderActiveTab()}

          {loading && (
            <LoaderModal
              type={false}
              visible={loading}
              message="Logging you out..."
              icon={"icon"}
              color="green-500"
              size={6}
            />
          )}

          <VpnPopup visible={showVpn} info={showVpnInfo} setShow={setShowVpn} />
          <CredPopup
            creds={credential}
            onSave={handleSaveCreds}
            onClose={() => setCredential({ ...credential, visible: false })}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
