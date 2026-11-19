import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const { auth } = usePage().props;
    const authUser = auth.user;
    const [loadingRoute, setLoadingRoute] = useState(null);

    const navItems = [
        {
            title: 'Dashboard',
            icon: 'ri-dashboard-3-line',
            route: 'dashboard',
        },
        {
            title: 'Onboard Users',
            icon: 'ri-user-follow-line',
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
            title: 'Product Master',
            icon: 'ri-store-2-line',
            id: 'sidebarCatalog',
            activePattern: 'admin.catalog.*',
            children: [
                {
                    title: 'Categories & Sub-Categories',
                    route: 'admin.catalog.categories',
                },
                {
                    title: 'Units of Measure (UOM)',
                    route: 'admin.catalog.uoms',
                },
                {
                    title: 'Brands Master',
                    route: 'admin.catalog.brands',
                },
                {
                    title: 'Products & Multi-UOM',
                    route: 'admin.catalog.products',
                },
                {
                    title: 'Vendor Stock & Ledger',
                    route: 'admin.catalog.vendor-stocks',
                },
            ],
        },
    ];

    useEffect(() => {
        const unregisterStart = router.on('start', (event) => {
            try {
                const visitUrl = event?.detail?.visit?.url;
                if (!visitUrl) return;

                const urlStr = typeof visitUrl === 'string' ? visitUrl : (visitUrl.pathname || visitUrl.href || '');
                const targetPath = new URL(urlStr, window.location.origin).pathname;

                for (const item of navItems) {
                    if (item.route) {
                        try {
                            const itemPath = new URL(route(item.route), window.location.origin).pathname;
                            if (itemPath === targetPath) {
                                setLoadingRoute(item.route);
                                return;
                            }
                        } catch {}
                    }
                    if (item.children) {
                        for (const child of item.children) {
                            try {
                                const childPath = new URL(route(child.route), window.location.origin).pathname;
                                if (childPath === targetPath) {
                                    setLoadingRoute(child.route);
                                    return;
                                }
                            } catch {}
                        }
                    }
                }
            } catch {
                // Ignore url parse errors
            }
        });

        const unregisterFinish = router.on('finish', () => {
            setLoadingRoute(null);
        });

        const unregisterCancel = router.on('cancel', () => {
            setLoadingRoute(null);
        });

        const unregisterError = router.on('error', () => {
            setLoadingRoute(null);
        });

        return () => {
            unregisterStart();
            unregisterFinish();
            unregisterCancel();
            unregisterError();
        };
    }, []);

    const isRouteActive = (routeName) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    const hasChildLoading = (item) => {
        if (!item.children) return false;
        return item.children.some((child) => child.route === loadingRoute);
    };

    const isItemActive = (item) => {
        if (loadingRoute === item.route) {
            return true;
        }
        if (item.activePattern && isRouteActive(item.activePattern)) {
            return true;
        }
        if (item.route && isRouteActive(item.route)) {
            return true;
        }
        if (item.children) {
            return item.children.some(
                (child) =>
                    loadingRoute === child.route ||
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
                <Link
                    href={route('dashboard')}
                    onClick={() => setLoadingRoute('dashboard')}
                    className="logo position-relative"
                >
                    <span className="logo-light">
                        <span className="logo-lg"><img src="/assets/images/light-logo.png" alt="logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/light-logo.png" alt="small logo" /></span>
                    </span>

                    <span className="logo-dark">
                        <span className="logo-lg"><img src="/assets/images/dark-logo.png" style={{ height: '3rem' }} alt="dark logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/dark-logo.png" alt="small logo" /></span>
                    </span>

                    {loadingRoute === 'dashboard' && (
                        <span
                            className="position-absolute end-0 top-50 translate-middle-y me-3 spinner-border spinner-border-sm text-info"
                            role="status"
                            style={{ width: '0.85rem', height: '0.85rem', borderWidth: '1.5px' }}
                        ></span>
                    )}
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
                                {/* <div className="dropdown-header noti-title">
                                    <h6 className="text-overflow m-0">Welcome !</h6>
                                </div> */}

                                {/* item*/}
                                {/* <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-account-circle-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">My Account</span>
                                </a> */}

                                {/* item*/}
                                {/* <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-wallet-3-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Wallet : <span className="fw-semibold">$89.25k</span></span>
                                </a> */}

                                {/* item*/}
                                {/* <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-settings-2-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Settings</span>
                                </a> */}

                                {/* item*/}
                                {/* <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-question-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Support</span>
                                </a> */}

                                <div className="dropdown-divider"></div>

                                {/* item*/}
                                {/* <a href="javascript:void(0);" className="dropdown-item">
                                    <i className="ri-lock-line me-1 fs-16 align-middle"></i>
                                    <span className="align-middle">Lock Screen</span>
                                </a> */}

                                {/* item*/}
                                <Link
                                    href={route('logout')}
                                    method='post'
                                    as="button"
                                    onClick={() => setLoadingRoute('logout')}
                                    className="dropdown-item active fw-semibold text-danger w-100 text-start d-flex align-items-center justify-content-between"
                                >
                                    <span>
                                        <i className="ri-logout-box-line me-1 fs-16 align-middle"></i>
                                        <span className="align-middle">Sign Out</span>
                                    </span>
                                    {loadingRoute === 'logout' && (
                                        <span
                                            className="spinner-border spinner-border-sm text-danger ms-2"
                                            role="status"
                                            style={{ width: '0.85rem', height: '0.85rem', borderWidth: '1.5px' }}
                                        ></span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/*- Sidenav Menu */}
                    <ul className="side-nav">
                        <li className="side-nav-title">Navigation</li>

                        {navItems.map((item, index) => {
                            const active = isItemActive(item);
                            const childLoading = hasChildLoading(item);

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
                                            <span className="menu-icon">
                                                {childLoading ? (
                                                    <span
                                                        className="spinner-border spinner-border-sm text-info align-middle"
                                                        role="status"
                                                        style={{ width: '0.95rem', height: '0.95rem', borderWidth: '2px' }}
                                                    ></span>
                                                ) : (
                                                    <i className={item.icon}></i>
                                                )}
                                            </span>
                                            <span className="menu-text"> {item.title}</span>
                                            {childLoading ? (
                                                <span className="badge bg-info-subtle text-info fs-10 px-1 py-0 rounded ms-auto me-2">
                                                    Loading...
                                                </span>
                                            ) : null}
                                            <span className="menu-arrow"></span>
                                        </a>
                                        <div className={`collapse ${active ? 'show' : ''}`} id={item.id}>
                                            <ul className="sub-menu">
                                                {item.children.map((child, cIndex) => {
                                                    const isChildLoading = loadingRoute === child.route;
                                                    const childActive =
                                                        isRouteActive(child.route) ||
                                                        (child.activePattern && isRouteActive(child.activePattern));
                                                    return (
                                                        <li
                                                            key={child.route || cIndex}
                                                            className={`side-nav-item ${childActive || isChildLoading ? 'active' : ''}`}
                                                        >
                                                            <Link
                                                                href={route(child.route)}
                                                                onClick={() => setLoadingRoute(child.route)}
                                                                className={`side-nav-link ${childActive || isChildLoading ? 'active text-info fw-semibold' : ''}`}
                                                            >
                                                                <span className="menu-text d-flex align-items-center justify-content-between w-100">
                                                                    <span className="d-flex align-items-center gap-2">
                                                                        {isChildLoading ? (
                                                                            <span
                                                                                className="spinner-border spinner-border-sm text-info flex-shrink-0"
                                                                                role="status"
                                                                                style={{ width: '0.75rem', height: '0.75rem', borderWidth: '1.5px' }}
                                                                            ></span>
                                                                        ) : childActive ? (
                                                                            <span
                                                                                className="badge rounded-pill bg-info p-1 flex-shrink-0"
                                                                                style={{ width: 6, height: 6 }}
                                                                            ></span>
                                                                        ) : (
                                                                            <span
                                                                                className="badge rounded-pill bg-transparent p-1 flex-shrink-0"
                                                                                style={{ width: 6, height: 6 }}
                                                                            ></span>
                                                                        )}
                                                                        <span>{child.title}</span>
                                                                    </span>
                                                                    {isChildLoading && (
                                                                        <span className="badge bg-info-subtle text-info fs-10 px-1.5 py-0.5 rounded">
                                                                            Loading...
                                                                        </span>
                                                                    )}
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

                            const isItemLoading = loadingRoute === item.route;

                            return (
                                <li key={item.route || index} className={`side-nav-item ${active || isItemLoading ? 'active' : ''}`}>
                                    <Link
                                        href={route(item.route)}
                                        onClick={() => setLoadingRoute(item.route)}
                                        className={`side-nav-link ${active || isItemLoading ? 'active' : ''}`}
                                    >
                                        <span className="menu-icon">
                                            {isItemLoading ? (
                                                <span
                                                    className="spinner-border spinner-border-sm text-info align-middle"
                                                    role="status"
                                                    style={{ width: '0.95rem', height: '0.95rem', borderWidth: '2px' }}
                                                ></span>
                                            ) : (
                                                <i className={item.icon}></i>
                                            )}
                                        </span>
                                        <span className="menu-text"> {item.title} </span>
                                        {isItemLoading ? (
                                            <span className="badge bg-info-subtle text-info fs-10 ms-auto">
                                                Loading...
                                            </span>
                                        ) : (
                                            item.badge && (
                                                <span className={item.badge.className}>{item.badge.text}</span>
                                            )
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