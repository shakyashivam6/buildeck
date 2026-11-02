import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Topbar({ title, breadcrumbs }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { auth } = usePage().props;
    const authUser = auth.user;

    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        setIsDarkMode(currentTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const nextTheme = isDarkMode ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', nextTheme);
        setIsDarkMode(!isDarkMode);
        sessionStorage.setItem('__HIGHDMIN_THEME__', nextTheme);
    };

    const getRouteMeta = () => {
        try {
            if (route().current('dashboard') || route().current('dashboard_01')) {
                return {
                    title: 'Dashboard',
                    breadcrumbs: ['Admin', 'Dashboard'],
                };
            }
            if (route().current('admin.onboard.vendor')) {
                return {
                    title: 'Vendors Management',
                    breadcrumbs: ['Admin', 'Vendors', 'Onboard'],
                };
            }
            if (route().current('admin.onboard.customer')) {
                return {
                    title: 'Customers Management',
                    breadcrumbs: ['Admin', 'Customers', 'Onboard'],
                };
            }
            if (route().current('profile.edit')) {
                return {
                    title: 'Profile Settings',
                    breadcrumbs: ['User', 'Profile'],
                };
            }
        } catch {
            // fallback
        }

        return {
            title: 'Dashboard',
            breadcrumbs: ['Admin', 'Dashboard'],
        };
    };

    const meta = getRouteMeta();
    const currentTitle = title || meta.title;
    const currentBreadcrumbs = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : meta.breadcrumbs;

    return (
        <>
            {/* Topbar Start */}
            <header className="app-topbar">
                <div className="page-container topbar-menu">
                    <div className="d-flex align-items-center gap-2">

                        {/* Brand Logo */}
                        <Link href={route('dashboard')} className="logo">
                            <span className="logo-light">
                                <span className="logo-lg"><img src="/assets/images/light-logo.png" alt="logo" style={{ height: '2.5rem', objectFit: 'contain' }} /></span>
                                <span className="logo-sm"><img src="/assets/images/favicon.svg" alt="small logo" style={{ height: '2rem' }} /></span>
                            </span>

                            <span className="logo-dark">
                                <span className="logo-lg"><img src="/assets/images/dark-logo.png" alt="dark logo" style={{ height: '2.5rem', objectFit: 'contain' }} /></span>
                                <span className="logo-sm"><img src="/assets/images/favicon.svg" alt="small logo" style={{ height: '2rem' }} /></span>
                            </span>
                        </Link>

                        {/* Topbar Page Title & Breadcrumbs */}
                        <div className="topbar-item d-flex align-items-center">
                            <div className="d-flex flex-column justify-content-center py-1">
                                <h4 className="fs-18 fw-bold text-white mb-0 lh-sm">{currentTitle}</h4>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb mb-0 p-0 fs-12 text-white-50" style={{ gap: '4px' }}>
                                        {currentBreadcrumbs.map((crumb, idx) => {
                                            const label = typeof crumb === 'object' && crumb !== null ? (crumb.label || '') : crumb;
                                            const url = typeof crumb === 'object' && crumb !== null ? crumb.url : null;
                                            const isLast = idx === currentBreadcrumbs.length - 1;

                                            return (
                                                <li
                                                    key={idx}
                                                    className={`d-flex align-items-center ${
                                                        isLast
                                                            ? 'active text-white fw-medium'
                                                            : 'text-white text-opacity-75'
                                                    }`}
                                                >
                                                    {idx > 0 && <span className="me-1 opacity-75">&rsaquo;</span>}
                                                    {url && !isLast ? (
                                                        <Link href={url} className="text-white-50 text-decoration-none hover-white">
                                                            {label}
                                                        </Link>
                                                    ) : (
                                                        <span>{label}</span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">

                        {/* Notification Dropdown */}
                        <div className="topbar-item">
                            <div className="dropdown">
                                <button className="topbar-link dropdown-toggle drop-arrow-none" data-bs-toggle="dropdown"
                                    data-bs-offset="0,25" type="button" data-bs-auto-close="outside" aria-haspopup="false"
                                    aria-expanded="false">
                                    <i className="ri-notification-snooze-line animate-ring fs-22"></i>
                                    <span className="noti-icon-badge" ></span>
                                </button>

                                <div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg" style={{ minHeight: '300px' }}>
                                    <div className="p-2 border-bottom position-relative border-dashed">
                                        <div className="row align-items-center">
                                            <div className="col">
                                                <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                                            </div>
                                            <div className="col-auto">
                                                <div className="dropdown">
                                                    <a href="#" className="dropdown-toggle drop-arrow-none link-dark"
                                                        data-bs-toggle="dropdown" data-bs-offset="0,15" aria-expanded="false">
                                                        <i className="ri-settings-2-line fs-22 align-middle"></i>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-end">
                                                        {/* item*/}
                                                        <a href="javascript:void(0);" className="dropdown-item">Mark as Read</a>
                                                        {/* item*/}
                                                        <a href="javascript:void(0);" className="dropdown-item">Delete All</a>
                                                        {/* item*/}
                                                        <a href="javascript:void(0);" className="dropdown-item">Do not Disturb</a>
                                                        {/* item*/}
                                                        <a href="javascript:void(0);" className="dropdown-item">Other Settings</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="position-relative rounded-0" style={{ maxHeight: '300px' }} data-simplebar>
                                    </div>

                                    {/* All*/}
                                    <Link href="javascript:void(0);"
                                        className="dropdown-item position-absolute bottom-0 notification-item text-center text-reset text-decoration-underline fw-bold notify-item border-top border-light py-2">
                                        View All
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Light/Dark Mode Button */}
                        <div className="topbar-item d-none d-sm-flex">
                            <button className="topbar-link" id="light-dark-mode" type="button" onClick={toggleTheme}>
                                <i className={isDarkMode ? "ri-sun-line fs-22" : "ri-moon-line fs-22"}></i>
                            </button>
                        </div>

                        {/* User Dropdown */}
                        <div className="topbar-item nav-user">
                            <div className="dropdown">
                                <a className="topbar-link dropdown-toggle drop-arrow-none px-2" data-bs-toggle="dropdown"
                                    data-bs-offset="0,25" type="button" aria-haspopup="false" aria-expanded="false">
                                    <img src="/assets/images/users/avatar-1.jpg" width="32" className="rounded-circle me-lg-2 d-flex"
                                        alt="user-image" />
                                    <span className="d-lg-flex flex-column gap-1 d-none">
                                        <h5 className="my-0">{authUser?.name}</h5>
                                    </span>
                                    <i className="ri-arrow-down-s-line d-none d-lg-block align-middle ms-2"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    {/* item*/}
                                    <div className="dropdown-header noti-title">
                                        <h6 className="text-overflow m-0">Welcome !</h6>
                                    </div>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item">
                                        <i className="ri-account-circle-line me-1 fs-16 align-middle"></i>
                                        <span className="align-middle">My Account</span>
                                    </a>

                                    <div className="dropdown-divider"></div>

                                    <Link
                                        method="post"
                                        as="button"
                                        href={route('logout')}
                                        className="dropdown-item active fw-semibold text-danger"
                                    >
                                        <i className="ri-logout-box-line me-1 fs-16 align-middle"></i>
                                        <span className="align-middle">Sign Out</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
