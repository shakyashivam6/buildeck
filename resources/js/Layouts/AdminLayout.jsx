import Sidebar from "@/Components/Admin/Sidebar";
import Topbar from "@/Components/Admin/Topbar";
import Footer from "@/Components/Admin/Footer";
import ThemeCustomizer from "@/Components/Admin/ThemeCustomizer";

export default function AdminLayout({ children, title, breadcrumbs }) {
    return (
        <div className="wrapper">
            <Sidebar />
            <Topbar title={title} breadcrumbs={breadcrumbs} />
            <div className="page-content">
                <div className="page-container">
                    {children}
                </div>
                <ThemeCustomizer />
                <Footer />
            </div>
        </div>
    );
}
