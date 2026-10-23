
export default function Topbar() {
    return (
        <>
            {/* Topbar Start */}
            <header className="app-topbar">
                <div className="page-container topbar-menu">
                    <div className="d-flex align-items-center gap-2">

                        {/* Brand Logo */}
                        <a href="index.html" className="logo">
                            <span className="logo-light">
                                <span className="logo-lg"><img src="/assets/images/logo.png" alt="logo" /></span>
                                <span className="logo-sm"><img src="/assets/images/logo-sm.png" alt="small logo" /></span>
                            </span>

                            <span className="logo-dark">
                                <span className="logo-lg"><img src="/assets/images/logo-dark.png" alt="dark logo" /></span>
                                <span className="logo-sm"><img src="/assets/images/logo-sm.png" alt="small logo" /></span>
                            </span>
                        </a>

                        {/* Sidebar Menu Toggle Button */}
                        <button className="sidenav-toggle-button px-2">
                            <i className="ri-menu-5-line fs-24"></i>
                        </button>

                        {/* Horizontal Menu Toggle Button */}
                        <button className="topnav-toggle-button px-2" data-bs-toggle="collapse" data-bs-target="#topnav-menu-content">
                            <i className="ri-menu-5-line fs-24"></i>
                        </button>

                        {/* Topbar Page Title */}
                        <div className="topbar-item d-none d-md-flex">



                            <div>
                                <h4 className="page-title fs-18 fw-bold mb-0">Welcome!</h4>
                            </div>

                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">

                        {/* Search for small devices */}
                        <div className="topbar-item d-flex d-xl-none">
                            <button className="topbar-link" data-bs-toggle="modal" data-bs-target="#searchModal" type="button">
                                <i className="ri-search-line fs-22"></i>
                            </button>
                        </div>

                        {/* Button Trigger Search Modal */}
                        <div className="topbar-search d-none d-xl-flex gap-2 me-2 align-items-center" data-bs-toggle="modal"
                            data-bs-target="#searchModal" type="button">
                            <i className="ri-search-line fs-18"></i>
                            <span className="me-2">Search something..</span>
                        </div>

                        {/* Language Dropdown */}
                        <div className="topbar-item">
                            <div className="dropdown">
                                <button className="topbar-link" data-bs-toggle="dropdown" data-bs-offset="0,32" type="button"
                                    aria-haspopup="false" aria-expanded="false">
                                    <img src="/assets/images/flags/us.svg" alt="user-image" className="w-100 rounded" height="18"
                                        id="selected-language-image" />
                                </button>

                                <div className="dropdown-menu dropdown-menu-end">
                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item" data-translator-lang="en">
                                        <img src="/assets/images/flags/us.svg" alt="user-image" className="me-1 rounded" height="18"
                                            data-translator-image /> <span className="align-middle">English</span>
                                    </a>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item" data-translator-lang="hi">
                                        <img src="/assets/images/flags/in.svg" alt="user-image" className="me-1 rounded" height="18"
                                            data-translator-image /> <span className="align-middle">Hindi</span>
                                    </a>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item">
                                        <img src="/assets/images/flags/de.svg" alt="user-image" className="me-1 rounded" height="18" />
                                        <span className="align-middle">German</span>
                                    </a>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item">
                                        <img src="/assets/images/flags/it.svg" alt="user-image" className="me-1 rounded" height="18" />
                                        <span className="align-middle" >Italian</span>
                                    </a>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item">
                                        <img src="/assets/images/flags/es.svg" alt="user-image" className="me-1 rounded" height="18" />
                                        <span className="align-middle">Spanish</span>
                                    </a>

                                    {/* item*/}
                                    <a href="javascript:void(0);" className="dropdown-item">
                                        <img src="/assets/images/flags/ru.svg" alt="user-image" className="me-1 rounded" height="18" />
                                        <span className="align-middle">Russian</span>
                                    </a>

                                </div>
                            </div>
                        </div>

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
                                        {/* item*/}
                                        <div className="dropdown-item notification-item py-2 text-wrap active" id="notification-1">
                                            <span className="d-flex align-items-center">
                                                <span className="me-3 position-relative flex-shrink-0">
                                                    <img src="/assets/images/users/avatar-2.jpg" className="avatar-lg rounded-circle"
                                                        alt="" />
                                                </span>
                                                <span className="flex-grow-1 text-muted">
                                                    <span className="fw-medium text-body">Glady Haid</span> commented on <span
                                                        className="fw-medium text-body">Highdmin admin status</span>
                                                    <br />
                                                    <span className="fs-12">25m ago</span>
                                                </span>
                                                <span className="notification-item-close">
                                                    <button type="button"
                                                        className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                                                        data-dismissible="#notification-1">
                                                        <i className="ri-close-line fs-16"></i>
                                                    </button>
                                                </span>
                                            </span>
                                        </div>

                                        {/* item*/}
                                        <div className="dropdown-item notification-item py-2 text-wrap" id="notification-2">
                                            <span className="d-flex align-items-center">
                                                <span className="me-3 position-relative flex-shrink-0">
                                                    <img src="/assets/images/users/avatar-4.jpg" className="avatar-lg rounded-circle"
                                                        alt="" />
                                                </span>
                                                <span className="flex-grow-1 text-muted">
                                                    <span className="fw-medium text-body">Tommy Berry</span> donated <span
                                                        className="text-success">$100.00</span> for <span
                                                            className="fw-medium text-body">Carbon removal program</span>
                                                    <br />
                                                    <span className="fs-12">58m ago</span>
                                                </span>
                                                <span className="notification-item-close">
                                                    <button type="button"
                                                        className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                                                        data-dismissible="#notification-2">
                                                        <i className="ri-close-line fs-16"></i>
                                                    </button>
                                                </span>
                                            </span>
                                        </div>

                                        {/* item*/}
                                        <div className="dropdown-item notification-item py-2 text-wrap" id="notification-3">
                                            <span className="d-flex align-items-center">
                                                <div className="avatar-lg flex-shrink-0 me-3">
                                                    <span className="avatar-title bg-success-subtle text-success rounded-circle fs-22">
                                                        <iconify-icon icon="solar:wallet-money-bold-duotone"></iconify-icon>
                                                    </span>
                                                </div>
                                                <span className="flex-grow-1 text-muted">
                                                    You withdraw a <span className="fw-medium text-body">$500</span> by <span
                                                        className="fw-medium text-body">New York ATM</span>
                                                    <br />
                                                    <span className="fs-12">2h ago</span>
                                                </span>
                                                <span className="notification-item-close">
                                                    <button type="button"
                                                        className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                                                        data-dismissible="#notification-3">
                                                        <i className="ri-close-line fs-16"></i>
                                                    </button>
                                                </span>
                                            </span>
                                        </div>

                                        {/* item*/}
                                        <div className="dropdown-item notification-item py-2 text-wrap" id="notification-4">
                                            <span className="d-flex align-items-center">
                                                <span className="me-3 position-relative flex-shrink-0">
                                                    <img src="/assets/images/users/avatar-7.jpg" className="avatar-lg rounded-circle"
                                                        alt="" />
                                                </span>
                                                <span className="flex-grow-1 text-muted">
                                                    <span className="fw-medium text-body">Richard Allen</span> followed you in <span
                                                        className="fw-medium text-body">Facebook</span>
                                                    <br />
                                                    <span className="fs-12">3h ago</span>
                                                </span>
                                                <span className="notification-item-close">
                                                    <button type="button"
                                                        className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                                                        data-dismissible="#notification-4">
                                                        <i className="ri-close-line fs-16"></i>
                                                    </button>
                                                </span>
                                            </span>
                                        </div>

                                        {/* item*/}
                                        <div className="dropdown-item notification-item py-2 text-wrap" id="notification-5">
                                            <span className="d-flex align-items-center">
                                                <span className="me-3 position-relative flex-shrink-0">
                                                    <img src="/assets/images/users/avatar-10.jpg" className="avatar-lg rounded-circle"
                                                        alt="" />
                                                </span>
                                                <span className="flex-grow-1 text-muted">
                                                    <span className="fw-medium text-body">Victor Collier</span> liked you recent photo
                                                    in <span className="fw-medium text-body">Instagram</span>
                                                    <br />
                                                    <span className="fs-12">10h ago</span>
                                                </span>
                                                <span className="notification-item-close">
                                                    <button type="button"
                                                        className="btn btn-ghost-danger rounded-circle btn-sm btn-icon"
                                                        data-dismissible="#notification-5">
                                                        <i className="ri-close-line fs-16"></i>
                                                    </button>
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* All*/}
                                    <a href="javascript:void(0);"
                                        className="dropdown-item position-absolute bottom-0 notification-item text-center text-reset text-decoration-underline fw-bold notify-item border-top border-light py-2">
                                        View All
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Apps Dropdown */}
                        <div className="topbar-item d-none d-sm-flex">
                            <div className="dropdown">
                                <button className="topbar-link dropdown-toggle drop-arrow-none" data-bs-toggle="dropdown"
                                    data-bs-offset="0,25" type="button" aria-haspopup="false" aria-expanded="false">
                                    <i className="ri-apps-2-add-line fs-22"></i>
                                </button>
                                <div className="dropdown-menu dropdown-menu-end dropdown-menu-lg p-0">
                                    <div className="p-2">
                                        <div className="row g-0">
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/slack.svg" alt="slack" />
                                                    <span>Slack</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/gitlab.svg" alt="Github" />
                                                    <span>Gitlab</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/dribbble.svg" alt="dribbble" />
                                                    <span>Dribbble</span>
                                                </a>
                                            </div>
                                        </div>

                                        <div className="row g-0">
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/bitbucket.svg" alt="bitbucket" />
                                                    <span>Bitbucket</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/dropbox.svg" alt="dropbox" />
                                                    <span>Dropbox</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/google-cloud.svg" alt="G Suite" />
                                                    <span>G Cloud</span>
                                                </a>
                                            </div>
                                        </div> {/* end row*/}

                                        <div className="row g-0">
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/aws.svg" alt="bitbucket" />
                                                    <span>AWS</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/digital-ocean.svg" alt="dropbox" />
                                                    <span>Server</span>
                                                </a>
                                            </div>
                                            <div className="col">
                                                <a className="dropdown-icon-item" href="#">
                                                    <img src="/assets/images/brands/bootstrap.svg" alt="G Suite" />
                                                    <span>Bootstrap</span>
                                                </a>
                                            </div>
                                        </div> {/* end row*/}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button Trigger Customizer Offcanvas */}
                        <div className="topbar-item d-none d-sm-flex">
                            <button className="topbar-link" data-bs-toggle="offcanvas" data-bs-target="#theme-settings-offcanvas"
                                type="button">
                                <i className="ri-settings-4-line fs-22"></i>
                            </button>
                        </div>

                        {/* Light/Dark Mode Button */}
                        <div className="topbar-item d-none d-sm-flex">
                            <button className="topbar-link" id="light-dark-mode" type="button">
                                <i className="ri-moon-line fs-22"></i>
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
                                        <h5 className="my-0">Maxine K.</h5>
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
                                    <a href="javascript:void(0);" className="dropdown-item active fw-semibold text-danger">
                                        <i className="ri-logout-box-line me-1 fs-16 align-middle"></i>
                                        <span className="align-middle">Sign Out</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Topbar End */}

                {/* Search Modal  */}
                <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content bg-transparent">
                            <form>
                                <div className="card mb-1">
                                    <div className="px-3 py-2 d-flex flex-row align-items-center" id="top-search">
                                        <i className="ri-search-line fs-22"></i>
                                        <input type="search" className="form-control border-0" id="search-modal-input"
                                            placeholder="Search for actions, people," />
                                        <button type="submit" className="btn p-0" data-bs-dismiss="modal" aria-label="Close">[esc]</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}