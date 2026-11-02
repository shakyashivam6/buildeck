import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function CategoriesIndex({ categories = [], uoms = [] }) {
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);

    // Form for Category
    const categoryForm = useForm({
        name: '',
        code: '',
        display_order: 1,
    });

    // Form for Sub-Category
    const subCategoryForm = useForm({
        category_id: selectedCategory?.id || '',
        name: '',
        code: '',
        default_base_uom_id: '',
        packing_rule_desc: '',
        allows_loose_by_default: false,
        display_order: 1,
    });

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);

    const submitCategory = (e) => {
        e.preventDefault();
        categoryForm.post(route('admin.catalog.categories.store'), {
            onSuccess: () => {
                categoryForm.reset();
                setShowCategoryModal(false);
            },
        });
    };

    const submitSubCategory = (e) => {
        e.preventDefault();
        subCategoryForm.setData('category_id', selectedCategory?.id);
        subCategoryForm.post(route('admin.catalog.sub-categories.store'), {
            onSuccess: () => {
                subCategoryForm.reset();
                setShowSubModal(false);
            },
        });
    };

    return (
        <AdminLayout
            title="Categories & Sub-Categories Master"
            breadcrumbs={['Admin', 'Product Master', 'Categories']}
        >
            <Head title="Categories & Sub-Categories - BuilDeck Admin" />

            <div className="row g-3">
                {/* Left Column: Categories List */}
                <div className="col-lg-4 col-md-5">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                            <h5 className="card-title mb-0 fw-semibold">
                                <i className="ri-folder-3-line me-2 text-primary"></i>
                                Main Categories
                            </h5>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setShowCategoryModal(true)}
                            >
                                <i className="ri-add-line"></i> New
                            </button>
                        </div>
                        <div className="list-group list-group-flush">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory?.id === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-start-0 border-end-0 ${
                                            isSelected ? 'bg-primary-subtle border-primary text-primary fw-bold' : ''
                                        }`}
                                    >
                                        <div>
                                            <div className="fs-14">{cat.name}</div>
                                            <span className="text-muted fs-11 font-monospace">{cat.code}</span>
                                        </div>
                                        <span className={`badge rounded-pill ${isSelected ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                                            {cat.sub_categories?.length || 0} sub
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sub-Categories in selected Category */}
                <div className="col-lg-8 col-md-7">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                            <div>
                                <h5 className="card-title mb-0 fw-semibold">
                                    <i className="ri-node-tree me-2 text-success"></i>
                                    Sub-Categories of {selectedCategory?.name}
                                </h5>
                                <small className="text-muted">Master specifications, default base UOM and packaging rules</small>
                            </div>
                            <button
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                    subCategoryForm.setData('category_id', selectedCategory?.id || '');
                                    setShowSubModal(true);
                                }}
                            >
                                <i className="ri-add-line me-1"></i> Add Sub-Category
                            </button>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sub-Category</th>
                                            <th>Base UOM</th>
                                            <th>Packing / Sizing Rule</th>
                                            <th>Loose Sale Default</th>
                                            <th>Approved Brands</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedCategory?.sub_categories || selectedCategory.sub_categories.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-muted">
                                                    No sub-categories in this category yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedCategory.sub_categories.map((sub) => (
                                                <tr key={sub.id}>
                                                    <td>
                                                        <div className="fw-semibold text-dark">{sub.name}</div>
                                                        <span className="text-muted fs-11 font-monospace">{sub.code}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary-subtle text-secondary border">
                                                            {sub.default_base_uom?.name} ({sub.default_base_uom?.symbol})
                                                        </span>
                                                    </td>
                                                    <td className="fs-12 text-muted" style={{ maxWidth: '220px' }}>
                                                        {sub.packing_rule_desc || '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${sub.allows_loose_by_default ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {sub.allows_loose_by_default ? 'Allowed Loose' : 'Full Pack Only'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '240px' }}>
                                                            {sub.approved_brands && sub.approved_brands.length > 0 ? (
                                                                sub.approved_brands.slice(0, 3).map((b) => (
                                                                    <span key={b.id} className="badge bg-light text-dark border fs-11">
                                                                        {b.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted fs-11">-</span>
                                                            )}
                                                            {sub.approved_brands?.length > 3 && (
                                                                <span className="badge bg-dark-subtle text-dark fs-11">
                                                                    +{sub.approved_brands.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Category Modal */}
            {showCategoryModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Main Category</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <form onSubmit={submitCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Category Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categoryForm.data.name}
                                            onChange={(e) => categoryForm.setData('name', e.target.value)}
                                            placeholder="e.g. Structural & Masonry Materials"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categoryForm.data.code}
                                            onChange={(e) => categoryForm.setData('code', e.target.value)}
                                            placeholder="e.g. CAT_STRUCTURAL"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={categoryForm.processing}>Save Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Sub-Category Modal */}
            {showSubModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Sub-Category to {selectedCategory?.name}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSubModal(false)}></button>
                            </div>
                            <form onSubmit={submitSubCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Sub-Category Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subCategoryForm.data.name}
                                            onChange={(e) => subCategoryForm.setData('name', e.target.value)}
                                            placeholder="e.g. Cement, TMT Steel Bars"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subCategoryForm.data.code}
                                            onChange={(e) => subCategoryForm.setData('code', e.target.value)}
                                            placeholder="e.g. SUB_CEMENT"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Default Base UOM</label>
                                        <select
                                            className="form-select"
                                            value={subCategoryForm.data.default_base_uom_id}
                                            onChange={(e) => subCategoryForm.setData('default_base_uom_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Base Unit</option>
                                            {uoms.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Packing / Sizing Rule Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subCategoryForm.data.packing_rule_desc}
                                            onChange={(e) => subCategoryForm.setData('packing_rule_desc', e.target.value)}
                                            placeholder="e.g. Standard 50 Kg Moisture-Proof Bag"
                                        />
                                    </div>
                                    <div className="form-check form-switch mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="allowsLooseSwitch"
                                            checked={subCategoryForm.data.allows_loose_by_default}
                                            onChange={(e) => subCategoryForm.setData('allows_loose_by_default', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="allowsLooseSwitch">
                                            Allow Loose Sale by Default
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowSubModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success" disabled={subCategoryForm.processing}>Save Sub-Category</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

