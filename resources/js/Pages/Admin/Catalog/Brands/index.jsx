import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function BrandsIndex({ brands = { data: [] }, subCategories = [] }) {
    const [editingBrand, setEditingBrand] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        is_approved_master: true,
        sub_category_ids: [],
    });

    const openCreateModal = () => {
        setEditingBrand(null);
        reset();
        setData({
            name: '',
            is_approved_master: true,
            sub_category_ids: [],
        });
        setShowModal(true);
    };

    const openEditModal = (brand) => {
        setEditingBrand(brand);
        setData({
            name: brand.name,
            is_approved_master: !!brand.is_approved_master,
            sub_category_ids: brand.sub_categories ? brand.sub_categories.map(s => s.id) : [],
        });
        setShowModal(true);
    };

    const toggleSubCategory = (subId) => {
        if (data.sub_category_ids.includes(subId)) {
            setData('sub_category_ids', data.sub_category_ids.filter(id => id !== subId));
        } else {
            setData('sub_category_ids', [...data.sub_category_ids, subId]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBrand) {
            post(route('admin.catalog.brands.update', editingBrand.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingBrand(null);
                    reset();
                },
            });
        } else {
            post(route('admin.catalog.brands.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    return (
        <AdminLayout
            title="Brands Master"
            breadcrumbs={['Admin', 'Product Master', 'Brands Master']}
        >
            <Head title="Brands Master - BuilDeck Admin" />

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div>
                        <h5 className="card-title mb-0 fw-semibold">
                            <i className="ri-award-line me-2 text-primary"></i>
                            Approved Master Brands
                        </h5>
                        <small className="text-muted">Master brands approved for building material catalog</small>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                        <i className="ri-add-line me-1"></i> Add Brand
                    </button>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Brand Name</th>
                                    <th>Slug</th>
                                    <th>Status</th>
                                    <th>Linked Sub-Categories</th>
                                    <th>Products Count</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!brands.data || brands.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            No brands found. Click "Add Brand" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    brands.data.map((brand) => (
                                        <tr key={brand.id}>
                                            <td className="fw-semibold text-dark">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="avatar-xs bg-light rounded d-flex align-items-center justify-content-center border fw-bold text-primary">
                                                        {brand.name.charAt(0)}
                                                    </div>
                                                    {brand.name}
                                                </div>
                                            </td>
                                            <td className="font-monospace text-muted fs-12">{brand.slug}</td>
                                            <td>
                                                <span className={`badge ${brand.is_approved_master ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                                    {brand.is_approved_master ? 'Approved Master' : 'Custom'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '350px' }}>
                                                    {brand.sub_categories && brand.sub_categories.length > 0 ? (
                                                        brand.sub_categories.slice(0, 3).map((sub) => (
                                                            <span key={sub.id} className="badge bg-light text-dark border fs-11">
                                                                {sub.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted fs-12">All Categories</span>
                                                    )}
                                                    {brand.sub_categories?.length > 3 && (
                                                        <span className="badge bg-dark-subtle text-dark fs-11">
                                                            +{brand.sub_categories.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge rounded-pill bg-light text-dark border">
                                                    {brand.products_count || 0} products
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEditModal(brand)}
                                                >
                                                    <i className="ri-pencil-line"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingBrand ? 'Edit Brand' : 'Add Master Brand'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Brand Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. UltraTech, Tata Tiscon, Kajaria"
                                            required
                                        />
                                    </div>

                                    <div className="form-check form-switch mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="isApprovedSwitch"
                                            checked={data.is_approved_master}
                                            onChange={(e) => setData('is_approved_master', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isApprovedSwitch">
                                            Mark as Approved Master Brand
                                        </label>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Associated Sub-Categories</label>
                                        <p className="text-muted fs-12 mb-2">Select which building material categories this brand operates in:</p>
                                        <div className="row g-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                            {subCategories.map((sub) => (
                                                <div key={sub.id} className="col-md-6">
                                                    <div
                                                        className={`p-2 border rounded cursor-pointer d-flex align-items-center justify-content-between ${
                                                            data.sub_category_ids.includes(sub.id)
                                                                ? 'border-primary bg-primary-subtle'
                                                                : 'bg-white'
                                                        }`}
                                                        onClick={() => toggleSubCategory(sub.id)}
                                                    >
                                                        <span className="fs-13">{sub.name}</span>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={data.sub_category_ids.includes(sub.id)}
                                                            onChange={() => {}}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>Save Brand</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

