import Sidebar from "@/Components/Admin/Sidebar";
import Topbar from "@/Components/Admin/Topbar";
import Footer from "@/Components/Admin/Footer";

export default function ({ children }) {
    return (
        <div className="wrapper">
            <Sidebar />
            <Topbar />
            <div className="page-content">
                <div className="page-container">
                    {children}
                </div>
                <Footer />
            </div>
        </div>
    );
}