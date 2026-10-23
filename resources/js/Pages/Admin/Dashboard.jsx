import AdminLayout from "@/Layouts/AdminLayout";

export default function Dashboard() {
    return (
        <AdminLayout>
            {/* ============================================================== */}
            {/* Start Page Content here */}
            {/* ============================================================== */}

            <div className="page-content">
                <div className="page-container">

                    <div className="alert alert-info d-flex align-items-center d-none d-md-flex" role="alert">
                        <iconify-icon icon="solar:help-bold-duotone" className="fs-24 me-1"></iconify-icon>
                        <div><strong> Dear Maxine - </strong> We kindly encourage you to review your recent transactions and
                            financial commitments to ensure that your account is in good standing.</div>
                        <a href="#!" className="text-reset text-decoration-underline ms-auto link-offset-2"><b>Action
                            Now</b></a>
                    </div>

                    <div className="row row-cols-xxl-4 row-cols-md-2 row-cols-1">
                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-2 justify-content-between">
                                        <div>
                                            <h5 className="text-muted fs-13 fw-bold text-uppercase" title="Number of Orders">
                                                Total Orders</h5>
                                            <h3 className="my-2 py-1 fw-bold">687.3k</h3>
                                            <p className="mb-0 text-muted">
                                                <span className="text-danger me-1"><i className="ri-arrow-left-down-box-line"></i>
                                                    9.19%</span>
                                                <span className="text-nowrap">Since last month</span>
                                            </p>
                                        </div>
                                        <div className="avatar-xl flex-shrink-0">
                                            <span className="avatar-title bg-primary-subtle text-primary rounded-circle fs-42">
                                                <iconify-icon icon="solar:bill-list-bold-duotone"></iconify-icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end col */}

                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-2 justify-content-between">
                                        <div>
                                            <h5 className="text-muted fs-13 fw-bold text-uppercase" title="Revenue">Total
                                                Revenue</h5>
                                            <h3 className="my-2 py-1 fw-bold">$5.42M</h3>
                                            <p className="mb-0 text-muted">
                                                <span className="text-success me-1"><i className="ri-arrow-left-up-box-line"></i>
                                                    4.67%</span>
                                                <span className="text-nowrap">Since last month</span>
                                            </p>
                                        </div>
                                        <div className="avatar-xl flex-shrink-0">
                                            <span className="avatar-title bg-success-subtle text-success rounded-circle fs-42">
                                                <iconify-icon icon="solar:wad-of-money-bold-duotone"></iconify-icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end col */}

                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-2 justify-content-between">
                                        <div>
                                            <h5 className="text-muted fs-13 fw-bold text-uppercase" title="New Users">New Users
                                            </h5>
                                            <h3 className="my-2 py-1 fw-bold">45.3k</h3>
                                            <p className="mb-0 text-muted">
                                                <span className="text-success me-1"><i className="ri-arrow-left-up-box-line"></i>
                                                    2.85%</span>
                                                <span className="text-nowrap">Since last month</span>
                                            </p>
                                        </div>
                                        <div className="avatar-xl flex-shrink-0">
                                            <span className="avatar-title bg-warning-subtle text-warning rounded-circle fs-42">
                                                <iconify-icon icon="solar:user-plus-bold-duotone"></iconify-icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end col */}

                        <div className="col">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-2 justify-content-between">
                                        <div>
                                            <h5 className="text-muted fs-13 fw-bold text-uppercase"
                                                title="Customer Satisfaction">Customer Satisfaction</h5>
                                            <h3 className="my-2 py-1 fw-bold">94.6%</h3>
                                            <p className="mb-0 text-muted">
                                                <span className="text-success me-1"><i className="ri-arrow-left-up-box-line"></i>
                                                    1.32%</span>
                                                <span className="text-nowrap">Since last month</span>
                                            </p>
                                        </div>
                                        <div className="avatar-xl flex-shrink-0">
                                            <span className="avatar-title bg-info-subtle text-info rounded-circle fs-42">
                                                <iconify-icon icon="solar:sticker-smile-circle-bold-duotone"></iconify-icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>{/* end col */}
                    </div>{/* end row */}

                    <div className="row">
                        <div className="col-xl-6">
                            <div className="card">
                                <div className="d-flex card-header justify-content-between align-items-center">
                                    <div>
                                        <h4 className="header-title">Statistics</h4>
                                    </div>
                                    <div className="dropdown">
                                        <a href="#" className="dropdown-toggle drop-arrow-none card-drop"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="ri-more-2-fill fs-18"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Sales Report</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Export Report</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Profit</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Action</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body px-0 pt-0">
                                    <div className="bg-light bg-opacity-50">
                                        <div className="row text-center">
                                            <div className="col-md-3 col-6">
                                                <p className="text-muted mt-3 mb-1">Total Income</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-arrow-left-down-box-line text-success me-1"></span>
                                                    <span>$35.2k</span>
                                                </h4>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <p className="text-muted mt-3 mb-1">Total Expenditure</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-arrow-left-up-box-line text-danger me-1"></span>
                                                    <span>$18.9k</span>
                                                </h4>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <p className="text-muted mt-3 mb-1">Capital Invested</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-bar-chart-line me-1"></span>
                                                    <span>$5.2k</span>
                                                </h4>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <p className="text-muted mt-3 mb-1">Net Savings</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-bank-line me-1"></span>
                                                    <span>$8.1k</span>
                                                </h4>
                                            </div>
                                        </div>

                                    </div>

                                    <div dir="ltr" className="px-1">
                                        <div id="statistics-chart" className="apex-charts" data-colors="#02c0ce,#777edd"></div>
                                    </div>

                                </div>
                            </div> {/* end card*/}
                        </div> {/* end col*/}

                        <div className="col-xl-6">
                            <div className="card">
                                <div className="d-flex card-header justify-content-between align-items-center">
                                    <div>
                                        <h4 className="header-title">Total Revenue</h4>
                                    </div>
                                    <div className="dropdown">
                                        <a href="#" className="dropdown-toggle drop-arrow-none card-drop"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="ri-more-2-fill fs-18"></i>
                                        </a>
                                        <div className="dropdown-menu dropdown-menu-end">
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Sales Report</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Export Report</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Profit</a>
                                            {/* item*/}
                                            <a href="javascript:void(0);" className="dropdown-item">Action</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body px-0 pt-0">
                                    <div className="border-top border-bottom border-light border-dashed">
                                        <div className="row text-center align-items-center">
                                            <div className="col-md-3 col-6">
                                                <p className="text-muted mt-3 mb-1">Revenue</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-arrow-left-down-box-line text-success me-1"></span>
                                                    <span>$29.5k</span>
                                                </h4>
                                            </div>
                                            <div
                                                className="col-md-3 col-6 bg-light bg-opacity-50 border-start border-light border-dashed">
                                                <p className="text-muted mt-3 mb-1">Expenses</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-arrow-left-up-box-line text-danger me-1"></span>
                                                    <span>$15.07k</span>
                                                </h4>
                                            </div>
                                            <div className="col-md-3 col-6 border-start border-end border-light border-dashed">
                                                <p className="text-muted mt-3 mb-1">Investment</p>
                                                <h4 className="mb-3">
                                                    <span className="ri-bar-chart-line me-1"></span>
                                                    <span>$3.6k</span>
                                                </h4>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <img src="assets/images/cards/american-express.svg" alt="user-card"
                                                    height="36" />
                                                <img src="assets/images/cards/discover-card.svg" alt="user-card"
                                                    height="36" />
                                                <img src="assets/images/cards/mastercard.svg" alt="user-card" height="36" />
                                            </div>
                                        </div>
                                    </div>

                                    <div dir="ltr" className="px-2">
                                        <div id="revenue-chart" className="apex-charts" data-colors="#0acf97,#45bbe0"></div>
                                    </div>

                                </div>
                            </div> {/* end card*/}
                        </div> {/* end col*/}
                    </div> {/* end row*/}


                    <div className="row">
                        <div className="col-xxl-4">
                            <div className="card">
                                <div className="d-flex card-header justify-content-between align-items-center">
                                    <h4 className="header-title">Transactions</h4>
                                    <a href="javascript:void(0);" className="btn btn-sm btn-light">Add New <i
                                        className="ri-add-line ms-1"></i></a>
                                </div>
                                <div className="card-body p-0">
                                    <div className="bg-light bg-opacity-50 py-1 text-center">
                                        <p className="m-0"><b>69</b> Active brands out of <span className="fw-medium">102</span></p>
                                    </div>
                                    <div className="table-responsive">
                                        <table
                                            className="table table-custom table-centered table-sm table-nowrap table-hover mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span className="text-muted fs-12">Transaction ID</span> <br />
                                                        <h5 className="fs-14 mt-1">TXN001</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Date</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">2024-12-18</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Amount</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">$500.00</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-success"></i> Completed
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Details</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Refund</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span className="text-muted fs-12">Transaction ID</span> <br />
                                                        <h5 className="fs-14 mt-1">TXN002</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Date</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">2024-12-17</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Amount</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">$1,200.00</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-danger"></i> Failed</h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Retry</a>
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Details</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span className="text-muted fs-12">Transaction ID</span> <br />
                                                        <h5 className="fs-14 mt-1">TXN003</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Date</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">2024-12-16</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Amount</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">$300.00</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-warning"></i> Pending</h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Details</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Cancel</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span className="text-muted fs-12">Transaction ID</span> <br />
                                                        <h5 className="fs-14 mt-1">TXN004</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Date</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">2024-12-15</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Amount</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">$2,500.00</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-success"></i> Completed
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Details</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Refund</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span className="text-muted fs-12">Transaction ID</span> <br />
                                                        <h5 className="fs-14 mt-1">TXN005</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Date</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">2024-12-14</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Amount</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">$750.00</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-warning"></i> Pending</h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Details</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Cancel</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div> {/* end table-responsive*/}
                                </div> {/* end card-body*/}

                                <div className="card-footer">
                                    <div className="align-items-center justify-content-between row text-center text-sm-start">
                                        <div className="col-sm">
                                            <div className="text-muted">
                                                Showing <span className="fw-semibold">5</span> of <span
                                                    className="fw-semibold">95.6k</span> Transactions
                                            </div>
                                        </div>
                                        <div className="col-sm-auto mt-3 mt-sm-0">
                                            <ul
                                                className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
                                                <li className="page-item disabled">
                                                    <a href="#" className="page-link"><i className="ri-arrow-left-s-line"></i></a>
                                                </li>
                                                <li className="page-item active">
                                                    <a href="#" className="page-link">1</a>
                                                </li>
                                                <li className="page-item">
                                                    <a href="#" className="page-link">2</a>
                                                </li>
                                                <li className="page-item">
                                                    <a href="#" className="page-link">3</a>
                                                </li>
                                                <li className="page-item">
                                                    <a href="#" className="page-link"><i className="ri-arrow-right-s-line"></i></a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div> {/* */}
                                </div>

                            </div> {/* end card*/}
                        </div> {/* end col*/}

                        <div className="col-xxl-4">
                            <div className="card card-h-100">
                                <div className="card-header d-flex flex-wrap align-items-center gap-2">
                                    <h4 className="header-title me-auto">Recent New Users</h4>

                                    <div className="d-flex gap-2 justify-content-end text-end">
                                        <a href="javascript:void(0);" className="btn btn-sm btn-light">Import <i
                                            className="ri-download-line ms-1"></i></a>
                                        <a href="javascript:void(0);" className="btn btn-sm btn-primary">Export <i
                                            className="ri-export-line ms-1"></i></a>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <div className="bg-light bg-opacity-50 py-1 text-center">
                                        <p className="m-0"><b>895k</b> Active users out of <span className="fw-medium">965k</span>
                                        </p>
                                    </div>

                                    <div className="table-responsive">
                                        <table
                                            className="table table-custom table-centered table-sm table-nowrap table-hover mb-0">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-md flex-shrink-0 me-2">
                                                                <span className="avatar-title bg-primary-subtle rounded-circle">
                                                                    <img src="assets/images/users/avatar-1.jpg" alt=""
                                                                        height="26" className="rounded-circle" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted fs-12">Name</span> <br />
                                                                <h5 className="fs-14 mt-1">John Doe</h5>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Role</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">Administrator</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span>
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-success"></i> Active
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Profile</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Deactivate</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-md flex-shrink-0 me-2">
                                                                <span className="avatar-title bg-info-subtle rounded-circle">
                                                                    <img src="assets/images/users/avatar-2.jpg" alt=""
                                                                        height="26" className="rounded-circle" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted fs-12">Name</span> <br />
                                                                <h5 className="fs-14 mt-1">Jane Smith</h5>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Role</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">Editor</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span>
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-warning"></i> Pending
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Profile</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Activate</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-md flex-shrink-0 me-2">
                                                                <span
                                                                    className="avatar-title bg-secondary-subtle rounded-circle">
                                                                    <img src="assets/images/users/avatar-3.jpg" alt=""
                                                                        height="26" className="rounded-circle" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted fs-12">Name</span> <br />
                                                                <h5 className="fs-14 mt-1">Michael Brown</h5>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Role</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">Viewer</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span>
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-danger"></i> Inactive
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Activate</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Delete</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-md flex-shrink-0 me-2">
                                                                <span className="avatar-title bg-warning-subtle rounded-circle">
                                                                    <img src="assets/images/users/avatar-4.jpg" alt=""
                                                                        height="26" className="rounded-circle" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted fs-12">Name</span> <br />
                                                                <h5 className="fs-14 mt-1">Emily Davis</h5>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Role</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">Manager</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span>
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-success"></i> Active
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Profile</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Deactivate</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-md flex-shrink-0 me-2">
                                                                <span className="avatar-title bg-danger-subtle rounded-circle">
                                                                    <img src="assets/images/users/avatar-5.jpg" alt=""
                                                                        height="26" className="rounded-circle" />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted fs-12">Name</span> <br />
                                                                <h5 className="fs-14 mt-1">Robert Taylor</h5>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Role</span> <br />
                                                        <h5 className="fs-14 mt-1 fw-normal">Support</h5>
                                                    </td>
                                                    <td>
                                                        <span className="text-muted fs-12">Status</span>
                                                        <h5 className="fs-14 mt-1 fw-normal"><i
                                                            className="ri-circle-fill fs-12 text-warning"></i> Pending
                                                        </h5>
                                                    </td>
                                                    <td style="width: 30px;">
                                                        <div className="dropdown">
                                                            <a href="#"
                                                                className="dropdown-toggle text-muted drop-arrow-none card-drop p-0"
                                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                                <i className="ri-more-2-fill"></i>
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-end">
                                                                <a href="javascript:void(0);" className="dropdown-item">View
                                                                    Profile</a>
                                                                <a href="javascript:void(0);"
                                                                    className="dropdown-item">Activate</a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </div> {/* end table-responsive*/}
                                </div> {/* end card-body*/}

                                <div className="card-footer">
                                    <div className="align-items-center justify-content-between row text-center text-sm-start">
                                        <div className="col-sm">
                                            <div className="text-muted">
                                                Showing <span className="fw-semibold">5</span> of <span
                                                    className="fw-semibold">2596</span> Users
                                            </div>
                                        </div>
                                        <div className="col-sm-auto mt-3 mt-sm-0">
                                            <ul
                                                className="pagination pagination-boxed pagination-sm mb-0 justify-content-center">
                                                <li className="page-item disabled">
                                                    <a href="#" className="page-link"><i className="ri-arrow-left-s-line"></i></a>
                                                </li>
                                                <li className="page-item active">
                                                    <a href="#" className="page-link">1</a>
                                                </li>
                                                <li className="page-item">
                                                    <a href="#" className="page-link">2</a>
                                                </li>
                                                <li className="page-item">
                                                    <a href="#" className="page-link"><i className="ri-arrow-right-s-line"></i></a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div> {/* */}
                                </div>
                            </div> {/* end card*/}
                        </div> {/* end col*/}

                        <div className="col-xxl-4">
                            <div className="card">
                                <div
                                    className="card-header d-flex flex-wrap align-items-center gap-2 border-bottom border-dashed">
                                    <h4 className="header-title me-auto">Transactions Uses</h4>

                                    <div className="d-flex gap-2 justify-content-end text-end">
                                        <a href="javascript:void(0);" className="btn btn-sm btn-primary">Refresh <i
                                            className="ri-export-line ms-1"></i></a>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div dir="ltr">
                                        <div id="data-visits-chart" className="apex-charts"
                                            data-colors="#a3e0e7,#8fdae2,#79d4dd,#61cdd8,#42c7d3"></div>

                                        <div className="row mt-2">
                                            <div className="col">
                                                <div className="d-flex justify-content-between align-items-center p-1">
                                                    <div>
                                                        <i className="ri-circle-fill fs-12 align-middle me-1 text-primary"></i>
                                                        <span className="align-middle fw-semibold">Direct</span>
                                                    </div>
                                                    <span className="fw-semibold text-muted float-end"><i
                                                        className="ri-arrow-down-double-line text-danger"></i> 965</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center p-1">
                                                    <div>
                                                        <i className="ri-circle-fill fs-12 text-success align-middle me-1"></i>
                                                        <span className="align-middle fw-semibold">Social</span>
                                                    </div>
                                                    <span className="fw-semibold text-muted float-end"><i
                                                        className="ri-arrow-up-double-line text-success"></i> 75</span>
                                                </div>
                                            </div>
                                            <div className="col">
                                                <div className="d-flex justify-content-between align-items-center p-1">
                                                    <div>
                                                        <i
                                                            className="ri-circle-fill fs-12 text-secondary align-middle me-1"></i>
                                                        <span className="align-middle fw-semibold"> Marketing</span>
                                                    </div>
                                                    <span className="fw-semibold text-muted float-end"><i
                                                        className="ri-arrow-up-double-line text-success"></i> 102</span>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center p-1">
                                                    <div>
                                                        <i className="ri-circle-fill fs-12 text-danger align-middle me-1"></i>
                                                        <span className="align-middle fw-semibold">Affiliates</span>
                                                    </div>
                                                    <span className="fw-semibold text-muted float-end"><i
                                                        className="ri-arrow-down-double-line text-danger"></i> 96</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> {/* end card-body*/}
                            </div> {/* end card*/}
                        </div> {/* end col*/}
                    </div> {/* end row*/}

                </div> {/* container */}

                {/* Footer Start */}
                <footer className="footer">
                    <div className="page-container">
                        <div className="row">
                            <div className="col-md-6 text-center text-md-start">
                                <script>document.write(new Date().getFullYear())</script> © Highdmin - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Coderthemes</span>
                            </div>
                            <div className="col-md-6">
                                <div className="text-md-end footer-links d-none d-md-block">
                                    <a href="javascript: void(0);">About</a>
                                    <a href="javascript: void(0);">Support</a>
                                    <a href="javascript: void(0);">Contact Us</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                {/* end Footer */}

            </div>

            {/* ============================================================== */}
            {/* End Page content */}
            {/* ============================================================== */}
        </AdminLayout>
    );
}