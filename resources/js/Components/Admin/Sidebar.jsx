import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { auth } = usePage().props;
    const authUser = auth.user;

    const navItems = [
        {
            title: 'Dashboard',
            icon: 'ri-dashboard-3-line',
            route: 'dashboard',
            // badge: {
            //     text: '5',
            //     className: 'badge bg-danger rounded-pill',
            // },
        },
        {
            title: 'Onboard Users',
            icon: 'ri-file-paper-line',
            id: 'sidebarOnboard',
            activePattern: 'admin.onboard.*',
            children: [
                {
                    title: 'Vendor',
                    route: 'admin.onboard.vendor',
                },
                {
                    title: 'Customer',
                    route: 'admin.onboard.customer',
                },
            ],
        },
        {
            title: 'Item Details',
            icon: 'ri-file-paper-line',
            id: 'sidebarItem',
            activePattern: 'admin.item.*',
            children: [
                {
                    title: 'Item',
                    route: 'admin.item',
                },
            ],
        },
    ];

    const isRouteActive = (routeName) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    const isItemActive = (item) => {
        if (item.activePattern && isRouteActive(item.activePattern)) {
            return true;
        }
        if (item.route && isRouteActive(item.route)) {
            return true;
        }
        if (item.children) {
            return item.children.some(
                (child) =>
                    isRouteActive(child.route) ||
                    (child.activePattern && isRouteActive(child.activePattern))
            );
        }
        return false;
    };

    return (
        <>
            {/* Menu */}
            {/* Sidenav Menu Start */}
            <div className="sidenav-menu">

                {/* Brand Logo */}
                <Link href={route('dashboard')} className="logo">
                    <span className="logo-light">
                        <span className="logo-lg"><img src="/assets/images/light-logo.png" alt="logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/light-logo.png" alt="small logo" /></span>
                    </span>

                    <span className="logo-dark">
                        <span className="logo-lg"><img src="/assets/images/dark-logo.png" style={{ height: '3rem' }} alt="dark logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/dark-logo.png" alt="small logo" /></span>
                    </span>
                </Link>

                {/* Sidebar Hover Menu Toggle Button */}
                <button className="button-sm-hover">
                    <i className="ri-circle-line align-middle"></i>
                </button>

                {/* Full Sidebar Menu Close Button */}
                <button className="button-close-fullsidebar">
                    <i className="ri-close-line align-middle"></i>
                </button>

                <div data-simplebar>

                    {/* User */}
                    <div className="sidenav-user">
                        <div className="dropdown-center">
                            <a className="topbar-link dropdown-toggle text-reset drop-arrow-none px-2 d-flex align-items-center justify-content-center" data-bs-toggle="dropdown" data-bs-offset="0,19" type="button" aria-haspopup="false" aria-expanded="false">
                                <img src="/assets/images/users/avatar-1.jpg" width="42" className="rounded-circle me-2 d-flex" alt="user-image" />
                                <span className="d-flex flex-column gap-1 sidebar-user-name">
                                    <h4 className="my-0 fw-bold fs-15">{authUser?.name}</h4>
                                    <h6 className="my-0">Admin Panel</h6>
                                </span>
                                <i className="ri-arrow-down-s-line d-block sidebar-user-arrow align-middle ms-2"></i>
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

                                {/* item*/}
                                <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-wallet-3-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Wallet : <span className="fw-semibold">$89.25k</span></span>
                                </a>

                                {/* item*/}
                                <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-settings-2-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Settings</span>
                                </a>

                                {/* item*/}
                                <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-question-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Support</span>
                                </a>

                                <div className="dropdown-divider"></div>

                                {/* item*/}
                                <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-lock-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Lock Screen</span>
                                </a>

                                {/* item*/}
                                <Link
                                    href={route('logout')}
                                    method='post'
                                    as="button"
                                    className="dropdown-item active fw-semibold text-danger w-100 text-start"
                                >
                                    <i className="ri-logout-box-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Sign Out</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/*- Sidenav Menu */}
                    <ul className="side-nav">
                        <li className="side-nav-title">Navigation</li>

                        {navItems.map((item, index) => {
                            const active = isItemActive(item);

                            if (item.children && item.children.length > 0) {
                                return (
                                    <li key={item.id || index} className={`side-nav-item ${active ? 'active' : ''}`}>
                                        <a
                                            data-bs-toggle="collapse"
                                            href={`#${item.id}`}
                                            aria-expanded={active ? 'true' : 'false'}
                                            aria-controls={item.id}
                                            className={`side-nav-link ${active ? 'active' : ''}`}
                                        >
                                            <span className="menu-icon"><i className={item.icon}></i></span>
                                            <span className="menu-text"> {item.title}</span>
                                            <span className="menu-arrow"></span>
                                        </a>
                                        <div className={`collapse ${active ? 'show' : ''}`} id={item.id}>
                                            <ul className="sub-menu">
                                                {item.children.map((child, cIndex) => {
                                                    const childActive =
                                                        isRouteActive(child.route) ||
                                                        (child.activePattern && isRouteActive(child.activePattern));
                                                    return (
                                                        <li
                                                            key={child.route || cIndex}
                                                            className={`side-nav-item ${childActive ? 'active' : ''}`}
                                                        >
                                                            <Link
                                                                href={route(child.route)}
                                                                className={`side-nav-link ${childActive ? 'active text-info fw-semibold' : ''}`}
                                                            >
                                                                <span className="menu-text d-flex align-items-center gap-2">
                                                                    {childActive && (
                                                                        <span
                                                                            className="badge rounded-pill bg-info p-1"
                                                                            style={{ width: 6, height: 6 }}
                                                                        ></span>
                                                                    )}
                                                                    {child.title}
                                                                </span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.route || index} className={`side-nav-item ${active ? 'active' : ''}`}>
                                    <Link href={route(item.route)} className={`side-nav-link ${active ? 'active' : ''}`}>
                                        <span className="menu-icon"><i className={item.icon}></i></span>
                                        <span className="menu-text"> {item.title} </span>
                                        {item.badge && (
                                            <span className={item.badge.className}>{item.badge.text}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="clearfix"></div>
                </div>
            </div>
            {/* Sidenav Menu End */}

            {/* Color Top line */}
            <div className="color-line"></div>
        </>
    );
}