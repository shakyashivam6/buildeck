export default function ThemeCustomizer() {
    return (
        <div className="offcanvas offcanvas-end" tabIndex="-1" id="theme-settings-offcanvas">
            <div className="d-flex align-items-center gap-2 px-3 py-3 offcanvas-header border-bottom border-dashed">
                <h5 className="flex-grow-1 mb-0">Theme Settings</h5>

                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>

            <div className="offcanvas-body p-0 h-100" data-simplebar>
                <div className="p-3 border-bottom border-dashed">
                    <h5 className="mb-3 fs-16 fw-bold">Color Scheme</h5>

                    <div className="row">
                        <div className="col-4">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-bs-theme" id="layout-color-light" value="light" />
                                <label className="form-check-label p-3 w-100 d-flex justify-content-center align-items-center" htmlFor="layout-color-light">
                                    <iconify-icon icon="solar:sun-bold-duotone" className="fs-32 text-muted"></iconify-icon>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Light</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-bs-theme" id="layout-color-dark" value="dark" />
                                <label className="form-check-label p-3 w-100 d-flex justify-content-center align-items-center" htmlFor="layout-color-dark">
                                    <iconify-icon icon="solar:cloud-sun-2-bold-duotone" className="fs-32 text-muted"></iconify-icon>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Dark</h5>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-bottom border-dashed">
                    <h5 className="mb-3 fs-16 fw-bold">Layout Mode</h5>

                    <div className="row">
                        <div className="col-4">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-layout-mode" id="layout-mode-fluid" value="fluid" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="layout-mode-fluid">
                                    <div>
                                        <span className="d-flex h-100">
                                            <span className="flex-shrink-0">
                                                <span className="bg-light d-flex h-100 border-end flex-column p-1 px-2">
                                                    <span className="d-block p-1 bg-dark-subtle rounded mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                </span>
                                            </span>
                                            <span className="flex-grow-1">
                                                <span className="d-flex h-100 flex-column rounded-2">
                                                    <span className="bg-light d-block p-1"></span>
                                                </span>
                                            </span>
                                        </span>
                                    </div>

                                    <div>
                                        <span className="d-flex h-100 flex-column">
                                            <span className="bg-light d-flex p-1 align-items-center border-bottom border-secondary border-opacity-25">
                                                <span className="d-block p-1 bg-dark-subtle rounded me-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-auto"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                            </span>
                                            <span className="bg-light d-block p-1"></span>
                                        </span>
                                    </div>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Fluid</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-layout-mode" id="data-layout-detached" value="detached" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="data-layout-detached">
                                    <span className="d-flex h-100 flex-column">
                                        <span className="bg-light d-flex p-1 align-items-center border-bottom ">
                                            <span className="d-block p-1 bg-dark-subtle rounded me-1"></span>
                                            <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-auto"></span>
                                            <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                            <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                            <span className="d-block border border-3 border-secondary border-opacity-25 rounded ms-1"></span>
                                        </span>
                                        <span className="d-flex h-100 p-1 px-2">
                                            <span className="flex-shrink-0">
                                                <span className="bg-light d-flex h-100 flex-column p-1 px-2">
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                    <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100"></span>
                                                </span>
                                            </span>
                                        </span>
                                        <span className="bg-light d-block p-1 mt-auto px-2"></span>
                                    </span>

                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Detached</h5>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-bottom border-dashed">
                    <h5 className="mb-3 fs-16 fw-bold">Topbar Color</h5>

                    <div className="row">
                        <div className="col-3">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-topbar-color" id="topbar-color-light" value="light" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="topbar-color-light">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-white"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Light</h5>
                        </div>

                        <div className="col-3">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-topbar-color" id="topbar-color-dark" value="dark" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="topbar-color-dark">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-dark"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Dark</h5>
                        </div>

                        <div className="col-3">
                            <div className="form-check card-radio">
                                <input className="form-check-input" type="radio" name="data-topbar-color" id="topbar-color-brand" value="brand" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="topbar-color-brand">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-primary"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Gradient</h5>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-bottom border-dashed">
                    <h5 className="mb-3 fs-16 fw-bold">Menu Color</h5>

                    <div className="row">
                        <div className="col-3">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-menu-color" id="sidenav-color-light" value="light" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="sidenav-color-light">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-white"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Light</h5>
                        </div>

                        <div className="col-3" style={{ '--ct-dark-rgb' : '64,73,84' }}>
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-menu-color" id="sidenav-color-dark" value="dark" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="sidenav-color-dark">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-dark"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Dark</h5>
                        </div>
                        <div className="col-3">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-menu-color" id="sidenav-color-brand" value="brand" />
                                <label className="form-check-label p-0 avatar-lg w-100 bg-light" htmlFor="sidenav-color-brand">
                                    <span className="d-flex align-items-center justify-content-center h-100">
                                        <span className="p-2 d-inline-flex shadow rounded-circle bg-primary"></span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Brand</h5>
                        </div>
                    </div>
                </div>

                <div className="p-3 .border-bottom .border-dashed">
                    <h5 className="mb-3 fs-16 fw-bold">Sidebar Size</h5>

                    <div className="row">
                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-default" value="default" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-default">
                                    <span className="d-flex h-100">
                                        <span className="flex-shrink-0">
                                            <span className="bg-light d-flex h-100 border-end  flex-column p-1 px-2">
                                                <span className="d-block p-1 bg-dark-subtle rounded mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                            </span>
                                        </span>
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Default</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-compact" value="compact" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-compact">
                                    <span className="d-flex h-100">
                                        <span className="flex-shrink-0">
                                            <span className="bg-light d-flex h-100 border-end  flex-column p-1">
                                                <span className="d-block p-1 bg-dark-subtle rounded mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                            </span>
                                        </span>
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Compact</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-small" value="condensed" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-small">
                                    <span className="d-flex h-100">
                                        <span className="flex-shrink-0">
                                            <span className="bg-light d-flex h-100 border-end flex-column" style={{ padding: '2px'}}>
                                                <span className="d-block p-1 bg-dark-subtle rounded mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                            </span>
                                        </span>
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Condensed</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-small-hover" value="sm-hover" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-small-hover">
                                    <span className="d-flex h-100">
                                        <span className="flex-shrink-0">
                                            <span className="bg-light d-flex h-100 border-end flex-column" style={{ padding: '2px' }}>
                                                <span className="d-block p-1 bg-dark-subtle rounded mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                                <span className="d-block border border-3 border-secondary border-opacity-25 rounded w-100 mb-1"></span>
                                            </span>
                                        </span>
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Hover View</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-full" value="full" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-full">
                                    <span className="d-flex h-100">
                                        <span className="flex-shrink-0">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="d-block p-1 bg-dark-subtle mb-1"></span>
                                            </span>
                                        </span>
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Full Layout</h5>
                        </div>

                        <div className="col-4">
                            <div className="form-check sidebar-setting card-radio">
                                <input className="form-check-input" type="radio" name="data-sidenav-size" id="sidenav-size-fullscreen" value="fullscreen" />
                                <label className="form-check-label p-0 avatar-xl w-100" htmlFor="sidenav-size-fullscreen">
                                    <span className="d-flex h-100">
                                        <span className="flex-grow-1">
                                            <span className="d-flex h-100 flex-column">
                                                <span className="bg-light d-block p-1"></span>
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <h5 className="fs-14 text-center text-muted mt-2">Hidden</h5>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-bottom border-dashed d-none">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fs-16 fw-bold mb-0">Container Width</h5>

                        <div className="btn-group radio" role="group">
                            <input type="radio" className="btn-check" name="data-container-position" id="container-width-fixed" value="fixed" />
                            <label className="btn btn-sm btn-soft-primary w-sm" htmlFor="container-width-fixed">Full</label>

                            <input type="radio" className="btn-check" name="data-container-position" id="container-width-scrollable" value="scrollable" />
                            <label className="btn btn-sm btn-soft-primary w-sm ms-0" htmlFor="container-width-scrollable">Boxed</label>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-bottom border-dashed d-none">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fs-16 fw-bold mb-0">Layout Position</h5>

                        <div className="btn-group radio" role="group">
                            <input type="radio" className="btn-check" name="data-layout-position" id="layout-position-fixed" value="fixed" />
                            <label className="btn btn-sm btn-soft-primary w-sm" htmlFor="layout-position-fixed">Fixed</label>

                            <input type="radio" className="btn-check" name="data-layout-position" id="layout-position-scrollable" value="scrollable" />
                            <label className="btn btn-sm btn-soft-primary w-sm ms-0" htmlFor="layout-position-scrollable">Scrollable</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex align-items-center gap-2 px-3 py-2 offcanvas-header border-top border-dashed">
                <button type="button" className="btn w-50 btn-soft-danger" id="reset-layout">Reset</button>
                <button type="button" className="btn w-50 btn-soft-info">Buy Now</button>
            </div>

        </div>
    );
}