import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
    const { auth } = usePage().props;
    const authUser = auth.user;

    return (
        <>
            {/* Menu */}
            {/* Sidenav Menu Start */}
            {/* a */}
            <div className="sidenav-menu">

                {/* Brand Logo */}
                <a href="index.html" className="logo">
                    <span className="logo-light">
                        <span className="logo-lg"><img src="/assets/images/logo.png" alt="logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/logo-sm.png" alt="small logo" /></span>
                    </span>

                    <span className="logo-dark">
                        <span className="logo-lg"><img src="/assets/images/logo.png" style={{ height: '3rem' }} alt="dark logo" /></span>
                        <span className="logo-sm"><img src="/assets/images/logo-sm.png" alt="small logo" /></span>
                    </span>
                </a>

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

                        <li className="side-nav-item">
                            <Link href={route('dashboard')} className="side-nav-link">
                                <span className="menu-icon"><i className="ri-dashboard-3-line"></i></span>
                                <span className="menu-text"> Dashboard </span>
                                <span className="badge bg-danger rounded-pill">5</span>
                            </Link>
                        </li>

                        <li className="side-nav-item">
                            <a data-bs-toggle="collapse" href="#sidebarOnboard" aria-expanded="false" aria-controls="sidebarOnboard"
                                className="side-nav-link">
                                <span className="menu-icon"><i className="ri-file-paper-line"></i></span>
                                <span className="menu-text"> Onboard Users</span>
                                <span className="menu-arrow"></span>
                            </a>
                            <div className="collapse" id="sidebarOnboard">
                                <ul className="sub-menu">
                                    <li className="side-nav-item">
                                        <Link href={ route('admin.onboard.vendor') } className="side-nav-link">
                                            <span className="menu-text">Vendor</span>
                                        </Link>
                                    </li>
                                    <li className="side-nav-item">
                                        <a href="apps-invoice-details.html" className="side-nav-link" disabled>
                                            <span className="menu-text">View Invoice</span>
                                        </a>
                                    </li>
                                    <li className="side-nav-item">
                                        <a href="apps-invoice-create.html" className="side-nav-link">
                                            <span className="menu-text">Create Invoice</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
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