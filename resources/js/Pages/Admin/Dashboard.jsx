import React, { useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard({ stats = {} }) {
    useEffect(() => {
        if (typeof window === "undefined" || !window.ApexCharts) {
            return;
        }

        let catChartInstance = null;
        let uomChartInstance = null;

        const catLabels = stats?.category_chart?.labels || [];
        const catSeries = stats?.category_chart?.series || [];

        const catEl = document.querySelector("#category-distribution-chart");
        if (catEl && catLabels.length > 0) {
            catEl.innerHTML = "";
            const catOptions = {
                chart: {
                    type: "bar",
                    height: 300,
                    toolbar: { show: false },
                },
                plotOptions: {
                    bar: {
                        borderRadius: 5,
                        horizontal: true,
                        barHeight: "55%",
                        distributed: true,
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: (val) => `${val} Products`,
                    style: { fontSize: "11px", fontWeight: "bold" },
                },
                series: [
                    {
                        name: "Products Count",
                        data: catSeries,
                    },
                ],
                xaxis: {
                    categories: catLabels,
                    labels: { style: { fontSize: "12px" } },
                },
                yaxis: {
                    labels: {
                        maxWidth: 160,
                        style: { fontSize: "12px", fontWeight: 500 },
                    },
                },
                colors: ["#3e60d5", "#47ad77", "#39afd1", "#ffbc00", "#fa5c7c", "#6c757d", "#fd7e14"],
                legend: { show: false },
                grid: {
                    borderColor: "#f1f3fa",
                },
            };
            catChartInstance = new window.ApexCharts(catEl, catOptions);
            catChartInstance.render();
        }

        const uomEl = document.querySelector("#uom-distribution-chart");
        const uomTypes = stats?.uom_types || {};
        const uomLabels = Object.keys(uomTypes).map((k) => (k.charAt(0).toUpperCase() + k.slice(1)).replace("_", " "));
        const uomSeries = Object.values(uomTypes);

        if (uomEl && uomLabels.length > 0) {
            uomEl.innerHTML = "";
            const uomOptions = {
                chart: {
                    type: "donut",
                    height: 270,
                },
                series: uomSeries,
                labels: uomLabels,
                colors: ["#3e60d5", "#47ad77", "#39afd1", "#ffbc00", "#fa5c7c"],
                legend: {
                    position: "bottom",
                    fontSize: "12px",
                },
                dataLabels: {
                    enabled: true,
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: "65%",
                        },
                    },
                },
            };
            uomChartInstance = new window.ApexCharts(uomEl, uomOptions);
            uomChartInstance.render();
        }

        return () => {
            if (catChartInstance) catChartInstance.destroy();
            if (uomChartInstance) uomChartInstance.destroy();
        };
    }, [stats]);

    return (
        <AdminLayout
            title="Dashboard"
            breadcrumbs={["Admin", "Dashboard"]}
        >
            <Head>
                <title>BuilDeck Admin Dashboard</title>
            </Head>

            {/* Top 4 KPI Metrics Row */}
            <div className="row row-cols-xxl-4 row-cols-md-2 row-cols-1 g-3 mb-3">
                {/* 1. Products */}
                <div className="col">
                    <div className="card h-100 shadow-sm border-0 border-start border-primary border-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 justify-content-between">
                                <div>
                                    <h5 className="text-muted fs-12 fw-bold text-uppercase mb-1">
                                        Total Products
                                    </h5>
                                    <h3 className="my-1 py-0 fw-bold text-dark">
                                        {stats?.total_products || 0}
                                    </h3>
                                    <p className="mb-0 fs-12 text-muted">
                                        <span className="text-success fw-semibold me-1">
                                            <i className="ri-checkbox-circle-fill"></i> {stats?.active_products || 0} Active
                                        </span>
                                        in Master Catalog
                                    </p>
                                </div>
                                <div className="avatar-lg flex-shrink-0">
                                    <span className="avatar-title bg-primary-subtle text-primary rounded-3 fs-32">
                                        <i className="ri-box-3-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-top border-light d-flex justify-content-between align-items-center">
                                <Link
                                    href="/admin/catalog/products"
                                    className="fs-12 fw-semibold text-primary text-decoration-none"
                                >
                                    Manage Products <i className="ri-arrow-right-line"></i>
                                </Link>
                                <span className="badge bg-primary-subtle text-primary fs-11">Multi-UOM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Categories & Sub-Categories */}
                <div className="col">
                    <div className="card h-100 shadow-sm border-0 border-start border-success border-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 justify-content-between">
                                <div>
                                    <h5 className="text-muted fs-12 fw-bold text-uppercase mb-1">
                                        Categories & Subs
                                    </h5>
                                    <h3 className="my-1 py-0 fw-bold text-dark">
                                        {stats?.total_categories || 0} <span className="fs-16 fw-normal text-muted">/ {stats?.total_sub_categories || 0}</span>
                                    </h3>
                                    <p className="mb-0 fs-12 text-muted">
                                        <span className="text-success fw-semibold me-1">
                                            <i className="ri-node-tree"></i> {stats?.total_sub_categories || 0} Sub-categories
                                        </span>
                                        configured
                                    </p>
                                </div>
                                <div className="avatar-lg flex-shrink-0">
                                    <span className="avatar-title bg-success-subtle text-success rounded-3 fs-32">
                                        <i className="ri-stack-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-top border-light d-flex justify-content-between align-items-center">
                                <Link
                                    href="/admin/catalog/categories"
                                    className="fs-12 fw-semibold text-success text-decoration-none"
                                >
                                    Manage Categories <i className="ri-arrow-right-line"></i>
                                </Link>
                                <span className="badge bg-success-subtle text-success fs-11">Hierarchy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Vendors & Suppliers */}
                <div className="col">
                    <div className="card h-100 shadow-sm border-0 border-start border-warning border-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 justify-content-between">
                                <div>
                                    <h5 className="text-muted fs-12 fw-bold text-uppercase mb-1">
                                        Registered Vendors
                                    </h5>
                                    <h3 className="my-1 py-0 fw-bold text-dark">
                                        {stats?.total_vendors || 0}
                                    </h3>
                                    <p className="mb-0 fs-12 text-muted">
                                        <span className="text-warning fw-semibold me-1">
                                            <i className="ri-store-2-line"></i> Building Material
                                        </span>
                                        Dealers & Suppliers
                                    </p>
                                </div>
                                <div className="avatar-lg flex-shrink-0">
                                    <span className="avatar-title bg-warning-subtle text-warning rounded-3 fs-32">
                                        <i className="ri-store-3-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-top border-light d-flex justify-content-between align-items-center">
                                <Link
                                    href="/admin/onboard/vendor"
                                    className="fs-12 fw-semibold text-warning text-decoration-none"
                                >
                                    Vendor Onboarding <i className="ri-arrow-right-line"></i>
                                </Link>
                                <span className="badge bg-warning-subtle text-warning fs-11">Suppliers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Customers & Buyers */}
                <div className="col">
                    <div className="card h-100 shadow-sm border-0 border-start border-info border-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 justify-content-between">
                                <div>
                                    <h5 className="text-muted fs-12 fw-bold text-uppercase mb-1">
                                        Registered Customers
                                    </h5>
                                    <h3 className="my-1 py-0 fw-bold text-dark">
                                        {stats?.total_customers || 0}
                                    </h3>
                                    <p className="mb-0 fs-12 text-muted">
                                        <span className="text-info fw-semibold me-1">
                                            <i className="ri-team-line"></i> Builders & Buyers
                                        </span>
                                        on Platform
                                    </p>
                                </div>
                                <div className="avatar-lg flex-shrink-0">
                                    <span className="avatar-title bg-info-subtle text-info rounded-3 fs-32">
                                        <i className="ri-user-star-line"></i>
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-top border-light d-flex justify-content-between align-items-center">
                                <Link
                                    href="/admin/onboard/customer"
                                    className="fs-12 fw-semibold text-info text-decoration-none"
                                >
                                    Customer Onboarding <i className="ri-arrow-right-line"></i>
                                </Link>
                                <span className="badge bg-info-subtle text-info fs-11">Clients</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Charts & Catalog Analytics */}
            <div className="row g-3 mb-3">
                {/* Products by Category Bar Chart */}
                <div className="col-xl-7">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center border-bottom border-light">
                            <div>
                                <h4 className="header-title mb-0">Catalog Products Distribution</h4>
                                <p className="text-muted fs-12 mb-0">Number of live products per major category</p>
                            </div>
                            <Link href="/admin/catalog/products" className="btn btn-sm btn-outline-primary">
                                View Catalog <i className="ri-external-link-line ms-1"></i>
                            </Link>
                        </div>
                        <div className="card-body">
                            {/* Summary pills */}
                            <div className="row text-center mb-3 g-2">
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded">
                                        <span className="text-muted fs-11 d-block text-uppercase fw-semibold">UOM Units</span>
                                        <h5 className="mb-0 fw-bold text-primary">{stats?.total_uoms || 0}</h5>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded">
                                        <span className="text-muted fs-11 d-block text-uppercase fw-semibold">Pricing Tiers</span>
                                        <h5 className="mb-0 fw-bold text-success">{stats?.total_pricing_tiers || 0}</h5>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="p-2 bg-light rounded">
                                        <span className="text-muted fs-11 d-block text-uppercase fw-semibold">Loose-Sale Enabled</span>
                                        <h5 className="mb-0 fw-bold text-warning">{stats?.loose_sale_products || 0}</h5>
                                    </div>
                                </div>
                            </div>

                            <div dir="ltr">
                                <div id="category-distribution-chart" style={{ minHeight: "300px" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Units of Measure (UOM) Breakdown Donut Chart */}
                <div className="col-xl-5">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center border-bottom border-light">
                            <div>
                                <h4 className="header-title mb-0">Units of Measure (UOM) Matrix</h4>
                                <p className="text-muted fs-12 mb-0">{stats?.total_uoms || 0} total units grouped by measurement type</p>
                            </div>
                            <Link href="/admin/catalog/uoms" className="btn btn-sm btn-outline-secondary">
                                UOM Master <i className="ri-scales-3-line ms-1"></i>
                            </Link>
                        </div>
                        <div className="card-body">
                            <div dir="ltr">
                                <div id="uom-distribution-chart" style={{ minHeight: "270px" }}></div>
                            </div>

                            {/* Top Brands Mini List */}
                            <div className="mt-3 pt-3 border-top border-light">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fs-13 fw-bold mb-0 text-dark">Top Brands in Master</h6>
                                    <Link href="/admin/catalog/brands" className="fs-11 text-muted text-decoration-none">
                                        {stats?.total_brands || 0} Brands Total &rarr;
                                    </Link>
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                    {(stats?.top_brands || []).map((b) => (
                                        <span
                                            key={b.id}
                                            className="badge bg-light text-dark border px-2 py-1 fs-11 d-inline-flex align-items-center gap-1"
                                        >
                                            <i className="ri-award-line text-primary"></i>
                                            {b.name}
                                            {b.count > 0 && (
                                                <span className="badge bg-primary-subtle text-primary ms-1">
                                                    {b.count}
                                                </span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Live Tables (Recent Products & Registered Accounts) */}
            <div className="row g-3">
                {/* Recent Products Master */}
                <div className="col-xxl-7">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center border-bottom border-light">
                            <div>
                                <h4 className="header-title mb-0">Recent Products in Catalog</h4>
                                <p className="text-muted fs-12 mb-0">Latest additions to the construction materials master</p>
                            </div>
                            <Link href="/admin/catalog/products" className="btn btn-sm btn-primary">
                                <i className="ri-add-line me-1"></i> Add Product
                            </Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-nowrap align-middle mb-0">
                                    <thead className="table-light fs-12 text-uppercase text-muted">
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Category / Sub-category</th>
                                            <th>Brand</th>
                                            <th>Base UOM & Price</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="fs-13">
                                        {(stats?.recent_products || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-4 text-muted">
                                                    No products found in catalog.
                                                </td>
                                            </tr>
                                        ) : (
                                            (stats?.recent_products || []).map((prod) => (
                                                <tr key={prod.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {prod.cover_image_url ? (
                                                                <img
                                                                    src={prod.cover_image_url}
                                                                    alt={prod.name}
                                                                    className="rounded border"
                                                                    style={{ width: "36px", height: "36px", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="rounded bg-light border d-flex align-items-center justify-content-center text-muted"
                                                                    style={{ width: "36px", height: "36px" }}
                                                                >
                                                                    <i className="ri-image-line fs-18"></i>
                                                                </div>
                                                            )}
                                                            <div style={{ maxWidth: "240px" }}>
                                                                <span className="fw-semibold text-dark text-truncate d-block" title={prod.name}>
                                                                    {prod.name}
                                                                </span>
                                                                <span className="badge bg-secondary-subtle text-secondary font-monospace fs-10">
                                                                    {prod.sku || "NO-SKU"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-medium text-dark d-block">{prod.category}</span>
                                                        <span className="text-muted fs-11">{prod.sub_category}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info-subtle text-info border border-info-subtle">
                                                            {prod.brand}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {prod.base_price ? (
                                                            <>
                                                                <span className="fw-bold text-dark">
                                                                    ₹{Number(prod.base_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                                                </span>
                                                                <span className="text-muted fs-11 d-block">
                                                                    per {prod.base_uom_code}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted fs-12">Not set</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                prod.is_active
                                                                    ? "bg-success-subtle text-success"
                                                                    : "bg-danger-subtle text-danger"
                                                            }`}
                                                        >
                                                            {prod.is_active ? "Active" : "Inactive"}
                                                        </span>
                                                        {prod.allow_loose && (
                                                            <span
                                                                className="badge bg-warning-subtle text-warning ms-1"
                                                                title="Loose Sale Allowed"
                                                            >
                                                                Loose
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent border-top border-light py-2 text-center">
                            <Link href="/admin/catalog/products" className="fs-12 text-primary fw-semibold text-decoration-none">
                                View All Products in Catalog &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Users / Accounts */}
                <div className="col-xxl-5">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-transparent d-flex justify-content-between align-items-center border-bottom border-light">
                            <div>
                                <h4 className="header-title mb-0">System Users & Accounts</h4>
                                <p className="text-muted fs-12 mb-0">{stats?.total_users || 0} registered user accounts</p>
                            </div>
                            <div className="d-flex gap-1">
                                <Link href={route('admin.onboard.vendor')} className="btn btn-sm btn-outline-warning">
                                    Vendors
                                </Link>
                                <Link href={route('admin.onboard.customer')} className="btn btn-sm btn-outline-info">
                                    Customers
                                </Link>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-nowrap align-middle mb-0">
                                    <thead className="table-light fs-12 text-uppercase text-muted">
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Contact</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="fs-13">
                                        {(stats?.recent_users || []).length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-muted">
                                                    No users registered yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            (stats?.recent_users || []).map((user) => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div
                                                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-12 flex-shrink-0"
                                                                style={{ width: "32px", height: "32px" }}
                                                            >
                                                                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                            </div>
                                                            <div>
                                                                <span className="fw-semibold text-dark d-block">
                                                                    {user.name}
                                                                </span>
                                                                <span className="text-muted fs-11">
                                                                    Joined {user.created_at}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge text-capitalize ${
                                                                user.role === "admin"
                                                                    ? "bg-danger-subtle text-danger"
                                                                    : user.role === "vendor"
                                                                    ? "bg-warning-subtle text-warning"
                                                                    : "bg-info-subtle text-info"
                                                            }`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="d-block text-dark fs-12">{user.email || user.mobile || "—"}</span>
                                                        {user.mobile && user.email && (
                                                            <span className="text-muted fs-11">{user.mobile}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                user.status === "active"
                                                                    ? "bg-success-subtle text-success"
                                                                    : "bg-secondary-subtle text-secondary"
                                                            }`}
                                                        >
                                                            {user.status || "active"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card-footer bg-transparent border-top border-light py-2 text-center">
                            <span className="fs-12 text-muted">
                                Manage user accounts from Onboard & Settings panels
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
