import AdminLayout from "@/Layouts/AdminLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import { Head, useForm, router } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function CategoriesIndex({ categories = [], uoms = [] }) {
    // Keep selectedCategory synced with updated category list
    const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || null);

    const selectedCategory = useMemo(() => {
        return categories.find(c => c.id === selectedCategoryId) || categories[0] || null;
    }, [categories, selectedCategoryId]);

    // Format UOMs for SearchableSelect
    const formattedUoms = useMemo(() => {
        return uoms.map(u => ({
            id: u.id,
            name: `${u.name} (${u.symbol})`,
        }));
    }, [uoms]);

    // Category modal & edit state
    const [editingCategory, setEditingCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const categoryForm = useForm({
        name: '',
        code: '',
        display_order: 1,
        is_active: true,
    });

    const openCreateCategoryModal = () => {
        setEditingCategory(null);
        categoryForm.reset();
        categoryForm.setData({
            name: '',
            code: '',
            display_order: (categories.length + 1),
            is_active: true,
        });
        setShowCategoryModal(true);
    };

    const openEditCategoryModal = (cat) => {
        setEditingCategory(cat);
        categoryForm.setData({
            name: cat.name,
            code: cat.code,
            display_order: cat.display_order || 1,
            is_active: !!cat.is_active,
        });
        setShowCategoryModal(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.post(route('admin.catalog.categories.update', editingCategory.id), {
                onSuccess: () => {
                    categoryForm.reset();
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                },
            });
        } else {
            categoryForm.post(route('admin.catalog.categories.store'), {
                onSuccess: () => {
                    categoryForm.reset();
                    setShowCategoryModal(false);
                },
            });
        }
    };

    const handleToggleCategoryStatus = (cat) => {
        router.post(route('admin.catalog.categories.toggle-status', cat.id));
    };

    const handleDeleteCategory = (cat) => {
        if (confirm(`Are you sure you want to delete category "${cat.name}" and all its sub-categories?`)) {
            router.delete(route('admin.catalog.categories.destroy', cat.id));
        }
    };

    // Sub-Category modal & edit state
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [showSubModal, setShowSubModal] = useState(false);

    const subCategoryForm = useForm({
        category_id: selectedCategory?.id || '',
        name: '',
        code: '',
        default_base_uom_id: '',
        packing_rule_desc: '',
        allows_loose_by_default: false,
        display_order: 1,
        is_active: true,
    });

    const openCreateSubModal = () => {
        setEditingSubCategory(null);
        subCategoryForm.reset();
        subCategoryForm.setData({
            category_id: selectedCategory?.id || '',
            name: '',
            code: '',
            default_base_uom_id: uoms[0]?.id || '',
            packing_rule_desc: '',
            allows_loose_by_default: false,
            display_order: ((selectedCategory?.sub_categories?.length || 0) + 1),
            is_active: true,
        });
        setShowSubModal(true);
    };

    const openEditSubModal = (sub) => {
        setEditingSubCategory(sub);
        subCategoryForm.setData({
            category_id: sub.category_id,
            name: sub.name,
            code: sub.code,
            default_base_uom_id: sub.default_base_uom_id,
            packing_rule_desc: sub.packing_rule_desc || '',
            allows_loose_by_default: !!sub.allows_loose_by_default,
            display_order: sub.display_order || 1,
            is_active: !!sub.is_active,
        });
        setShowSubModal(true);
    };

    const submitSubCategory = (e) => {
        e.preventDefault();
        if (editingSubCategory) {
            subCategoryForm.post(route('admin.catalog.sub-categories.update', editingSubCategory.id), {
                onSuccess: () => {
                    subCategoryForm.reset();
                    setShowSubModal(false);
                    setEditingSubCategory(null);
                },
            });
        } else {
            subCategoryForm.post(route('admin.catalog.sub-categories.store'), {
                onSuccess: () => {
                    subCategoryForm.reset();
                    setShowSubModal(false);
                },
            });
        }
    };

    const handleToggleSubCategoryStatus = (sub) => {
        router.post(route('admin.catalog.sub-categories.toggle-status', sub.id));
    };

    const handleDeleteSubCategory = (sub) => {
        if (confirm(`Are you sure you want to delete sub-category "${sub.name}"?`)) {
            router.delete(route('admin.catalog.sub-categories.destroy', sub.id));
        }
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
                                onClick={openCreateCategoryModal}
                            >
                                <i className="ri-add-line me-1"></i> New Category
                            </button>
                        </div>
                        <div className="list-group list-group-flush">
                            {categories.map((cat) => {
                                const isSelected = selectedCategory?.id === cat.id;
                                return (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border-start-0 border-end-0 cursor-pointer ${
                                            isSelected ? 'bg-primary-subtle border-primary text-primary fw-bold' : ''
                                        }`}
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            {/* Status Dot */}
                                            <span
                                                className={`badge rounded-circle p-1 ${cat.is_active ? 'bg-success' : 'bg-secondary'}`}
                                                style={{ width: '8px', height: '8px' }}
                                                title={cat.is_active ? 'Active Category' : 'Inactive Category'}
                                            ></span>
                                            <div>
                                                <div className="fs-14">{cat.name}</div>
                                                <span className="text-muted fs-11 font-monospace">{cat.code}</span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge rounded-pill ${isSelected ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                                                {cat.sub_categories?.length || 0} sub
                                            </span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-light p-1 px-2 border"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditCategoryModal(cat);
                                                }}
                                                title="Edit Category"
                                            >
                                                <i className="ri-pencil-line fs-13"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Sub-Categories in selected Category */}
                <div className="col-lg-8 col-md-7">
                    <div className="card shadow-sm border-0 h-100">
                        {/* Header with Category Controls */}
                        <div className="card-header bg-white py-3">
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div>
                                    <div className="d-flex align-items-center gap-2">
                                        <h5 className="card-title mb-0 fw-semibold text-dark">
                                            <i className="ri-node-tree me-1 text-primary"></i>
                                            {selectedCategory?.name}
                                        </h5>
                                        <button
                                            type="button"
                                            onClick={() => selectedCategory && handleToggleCategoryStatus(selectedCategory)}
                                            className={`badge border-0 cursor-pointer ${
                                                selectedCategory?.is_active
                                                    ? 'bg-success-subtle text-success'
                                                    : 'bg-danger-subtle text-danger'
                                            }`}
                                            title="Click to toggle Category Active/Inactive"
                                        >
                                            {selectedCategory?.is_active ? '● Active' : '○ Inactive'}
                                        </button>
                                    </div>
                                    <small className="text-muted">
                                        Code: <code className="text-dark bg-light px-1">{selectedCategory?.code}</code> | Sub-Categories: {selectedCategory?.sub_categories?.length || 0}
                                    </small>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    {selectedCategory && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => openEditCategoryModal(selectedCategory)}
                                                title="Edit this Category"
                                            >
                                                <i className="ri-edit-line me-1"></i> Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteCategory(selectedCategory)}
                                                title="Delete Category"
                                            >
                                                <i className="ri-delete-bin-line me-1"></i> Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="btn btn-sm btn-success ms-2"
                                        onClick={openCreateSubModal}
                                    >
                                        <i className="ri-add-line me-1"></i> Add Sub-Category
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sub-Category</th>
                                            <th>Base UOM</th>
                                            <th>Packing / Sizing Rule</th>
                                            <th>Loose Sale</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!selectedCategory?.sub_categories || selectedCategory.sub_categories.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-5 text-muted">
                                                    No sub-categories in this category yet. Click "Add Sub-Category" to create one.
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedCategory.sub_categories.map((sub) => (
                                                <tr key={sub.id} className={!sub.is_active ? 'opacity-75 bg-light-subtle' : ''}>
                                                    <td>
                                                        <div className="fw-semibold text-dark">{sub.name}</div>
                                                        <span className="text-muted fs-11 font-monospace">{sub.code}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary-subtle text-secondary border">
                                                            {sub.default_base_uom?.name} ({sub.default_base_uom?.symbol})
                                                        </span>
                                                    </td>
                                                    <td className="fs-12 text-muted" style={{ maxWidth: '200px' }}>
                                                        {sub.packing_rule_desc || '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${sub.allows_loose_by_default ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {sub.allows_loose_by_default ? 'Loose OK' : 'Full Pack'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleSubCategoryStatus(sub)}
                                                            className={`badge border-0 cursor-pointer ${
                                                                sub.is_active
                                                                    ? 'bg-success-subtle text-success'
                                                                    : 'bg-secondary-subtle text-secondary'
                                                            }`}
                                                            title="Click to toggle status"
                                                        >
                                                            {sub.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={() => openEditSubModal(sub)}
                                                                title="Edit Sub-Category"
                                                            >
                                                                <i className="ri-pencil-line"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDeleteSubCategory(sub)}
                                                                title="Delete Sub-Category"
                                                            >
                                                                <i className="ri-delete-bin-line"></i>
                                                            </button>
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

            {/* Category Modal (Create & Edit) */}
            {showCategoryModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Main Category'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <form onSubmit={submitCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Category Name <span className="text-danger">*</span></label>
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
                                        <label className="form-label fw-semibold">Category Code <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={categoryForm.data.code}
                                            onChange={(e) => categoryForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g. CAT_STRUCTURAL"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Display Order</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={categoryForm.data.display_order}
                                            onChange={(e) => categoryForm.setData('display_order', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-check form-switch mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="categoryActiveSwitch"
                                            checked={categoryForm.data.is_active}
                                            onChange={(e) => categoryForm.setData('is_active', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="categoryActiveSwitch">
                                            Status: {categoryForm.data.is_active ? 'Active' : 'Inactive'}
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={categoryForm.processing}>
                                        <i className="ri-save-line me-1"></i>
                                        {editingCategory ? 'Update Category' : 'Save Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Category Modal (Create & Edit) */}
            {showSubModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingSubCategory ? `Edit Sub-Category: ${editingSubCategory.name}` : `Add Sub-Category to ${selectedCategory?.name}`}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowSubModal(false)}></button>
                            </div>
                            <form onSubmit={submitSubCategory}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Parent Category <span className="text-danger">*</span></label>
                                        <select
                                            className="form-select"
                                            value={subCategoryForm.data.category_id}
                                            onChange={(e) => subCategoryForm.setData('category_id', e.target.value)}
                                            required
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Sub-Category Name <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subCategoryForm.data.name}
                                            onChange={(e) => subCategoryForm.setData('name', e.target.value)}
                                            placeholder="e.g. Cement, TMT Steel Bars, Ceramic Tiles"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Code <span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={subCategoryForm.data.code}
                                            onChange={(e) => subCategoryForm.setData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g. SUB_CEMENT"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Default Base UOM <span className="text-danger">*</span></label>
                                        <SearchableSelect
                                            options={formattedUoms}
                                            value={subCategoryForm.data.default_base_uom_id}
                                            onChange={(val) => subCategoryForm.setData('default_base_uom_id', val)}
                                            placeholder="Search and Select Base Unit..."
                                        />
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
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <div className="form-check form-switch p-2 border rounded">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input ms-0 me-2"
                                                    id="allowsLooseSwitch"
                                                    checked={subCategoryForm.data.allows_loose_by_default}
                                                    onChange={(e) => subCategoryForm.setData('allows_loose_by_default', e.target.checked)}
                                                />
                                                <label className="form-check-label fs-13" htmlFor="allowsLooseSwitch">
                                                    Allow Loose Sale
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="form-check form-switch p-2 border rounded">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input ms-0 me-2"
                                                    id="subActiveSwitch"
                                                    checked={subCategoryForm.data.is_active}
                                                    onChange={(e) => subCategoryForm.setData('is_active', e.target.checked)}
                                                />
                                                <label className="form-check-label fs-13" htmlFor="subActiveSwitch">
                                                    Status: {subCategoryForm.data.is_active ? 'Active' : 'Inactive'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowSubModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success" disabled={subCategoryForm.processing}>
                                        <i className="ri-save-line me-1"></i>
                                        {editingSubCategory ? 'Update Sub-Category' : 'Save Sub-Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
