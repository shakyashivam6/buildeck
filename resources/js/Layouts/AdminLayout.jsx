import Sidebar from "@/Components/Admin/Sidebar";
import Topbar from "@/Components/Admin/Topbar";
import Footer from "@/Components/Admin/Footer";
import ThemeCustomizer from "@/Components/Admin/ThemeCustomizer";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function AdminLayout({ children, title, breadcrumbs }) {
    const [isPageLoading, setIsPageLoading] = useState(false);

    useEffect(() => {
        const unregisterStart = router.on('start', () => {
            setIsPageLoading(true);
        });

        const unregisterFinish = router.on('finish', () => {
            setIsPageLoading(false);
        });

        const unregisterCancel = router.on('cancel', () => {
            setIsPageLoading(false);
        });

        const unregisterError = router.on('error', () => {
            setIsPageLoading(false);
        });

        return () => {
            unregisterStart();
            unregisterFinish();
            unregisterCancel();
            unregisterError();
        };
    }, []);

    return (
        <div className="wrapper">
            {/* Top Loading Progress Line */}
            {isPageLoading && (
                <div
                    className="admin-top-progress-bar"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        zIndex: 99999,
                        background: 'linear-gradient(90deg, #0dcaf0, #0d6efd, #0dcaf0)',
                        backgroundSize: '200% 100%',
                        animation: 'adminPageLoaderShimmer 1.2s linear infinite',
                    }}
                />
            )}

            {/* Floating Top Badge Indicator */}
            {isPageLoading && (
                <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-2"
                    style={{ zIndex: 99998, pointerEvents: 'none' }}
                >
                    <div
                        className="bg-dark text-white px-3 py-1 rounded-pill shadow-lg d-flex align-items-center gap-2 border border-secondary border-opacity-25"
                        style={{ fontSize: '13px' }}
                    >
                        <span
                            className="spinner-border spinner-border-sm text-info"
                            role="status"
                            style={{ width: '0.85rem', height: '0.85rem', borderWidth: '2px' }}
                        ></span>
                        <span className="fw-medium">Loading data...</span>
                    </div>
                </div>
            )}

            <Sidebar />
            <Topbar title={title} breadcrumbs={breadcrumbs} />
            <div className="page-content position-relative">
                <div
                    className="page-container"
                    style={{
                        opacity: isPageLoading ? 0.6 : 1,
                        pointerEvents: isPageLoading ? 'none' : 'auto',
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    {children}
                </div>
                <ThemeCustomizer />
                <Footer />
            </div>

            <style>{`
                @keyframes adminPageLoaderShimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
