import AdminLayout from "@/Layouts/AdminLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import InfoTooltip from "@/Components/InfoTooltip";
import { Head, useForm, router } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function ProductsIndex({
    products = { data: [] },
    subCategories = [],
    brands = [],
    uoms = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form'
    const [editingProduct, setEditingProduct] = useState(null);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [subCatFilter, setSubCatFilter] = useState(filters.sub_category_id || '');

    // Formatted UOMs with symbols for searchable dropdowns
    const formattedUoms = useMemo(() => {
        return uoms.map(u => ({
            id: u.id,
            name: u.name,
            symbol: u.symbol,
            display_name: `${u.name} (${u.symbol})`,
        }));
    }, [uoms]);

    // Image preview states
    const [coverPreview, setCoverPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [existingGallery, setExistingGallery] = useState([]);
    const [removedGalleryPaths, setRemovedGalleryPaths] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        sku: '',
        sub_category_id: '',
        brand_id: '',
        base_uom_id: '',
        description: '',
        packing_rule_desc: '',
        cover_image: null,
        gallery_images: [],
        remove_cover: false,
        remove_gallery_images: [],
        pricing_matrix: [
            {
                uom_id: '',
                conversion_factor: 1.0,
                selling_price: '',
                mrp: '',
                bulk_discount_price: '',
                allow_loose_sale: false,
                min_order_qty: 1,
                step_qty: 1,
                pack_contain_qty: '',
                is_default_selling_unit: true,
            },
        ],
    });

    const handleSubCategoryChange = (subCatId) => {
        const selected = subCategories.find(s => s.id === parseInt(subCatId));
        setData({
            ...data,
            sub_category_id: subCatId,
            base_uom_id: selected ? selected.default_base_uom_id : data.base_uom_id,
            packing_rule_desc: selected?.packing_rule_desc || data.packing_rule_desc,
            pricing_matrix: [
                {
                    uom_id: selected ? selected.default_base_uom_id : '',
                    conversion_factor: 1.0,
                    selling_price: '',
                    mrp: '',
                    bulk_discount_price: '',
                    allow_loose_sale: selected ? !!selected.allows_loose_by_default : false,
                    min_order_qty: 1,
                    step_qty: 1,
                    pack_contain_qty: '',
                    is_default_selling_unit: true,
                },
            ],
        });
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData((prev) => ({
                ...prev,
                cover_image: file,
                remove_cover: false,
            }));
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveCover = () => {
        setData((prev) => ({
            ...prev,
            cover_image: null,
            remove_cover: true,
        }));
        setCoverPreview(null);
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData((prev) => ({
                ...prev,
                gallery_images: [...prev.gallery_images, ...files],
            }));

            const newPreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                file,
            }));
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveNewGalleryImage = (index) => {
        const updatedPreviews = galleryPreviews.filter((_, i) => i !== index);
        const updatedFiles = data.gallery_images.filter((_, i) => i !== index);
        setGalleryPreviews(updatedPreviews);
        setData('gallery_images', updatedFiles);
    };

    const handleRemoveExistingGalleryImage = (path) => {
        const updatedExisting = existingGallery.filter(item => item.path !== path);
        setExistingGallery(updatedExisting);
        const updatedRemoved = [...removedGalleryPaths, path];
        setRemovedGalleryPaths(updatedRemoved);
        setData('remove_gallery_images', updatedRemoved);
    };

    const addMatrixRow = () => {
        setData('pricing_matrix', [
            ...data.pricing_matrix,
            {
                uom_id: '',
                conversion_factor: 1.0,
                selling_price: '',
                mrp: '',
                bulk_discount_price: '',
                allow_loose_sale: false,
                min_order_qty: 1,
                step_qty: 1,
                pack_contain_qty: '',
                is_default_selling_unit: false,
            },
        ]);
    };

    const removeMatrixRow = (index) => {
        if (data.pricing_matrix.length <= 1) return;
        const updated = data.pricing_matrix.filter((_, i) => i !== index);
        setData('pricing_matrix', updated);
    };

    const updateMatrixRow = (index, field, value) => {
        const updated = [...data.pricing_matrix];
        updated[index][field] = value;

        if (field === 'is_default_selling_unit' && value === true) {
            updated.forEach((row, i) => {
                if (i !== index) row.is_default_selling_unit = false;
            });
        }

        setData('pricing_matrix', updated);
    };

    const openCreateForm = () => {
        setEditingProduct(null);
        reset();
        setCoverPreview(null);
        setGalleryPreviews([]);
        setExistingGallery([]);
        setRemovedGalleryPaths([]);
        setActiveTab('form');
    };

    const openEditForm = (item) => {
        setEditingProduct(item);
        setCoverPreview(item.cover_image_url || null);
        setGalleryPreviews([]);
        setRemovedGalleryPaths([]);

        // Existing gallery
        if (item.gallery_images && Array.isArray(item.gallery_images)) {
            const mapped = item.gallery_images.map((path, idx) => ({
                path,
                url: item.gallery_image_urls ? item.gallery_image_urls[idx] : `/storage/${path}`,
            }));
            setExistingGallery(mapped);
        } else {
            setExistingGallery([]);
        }

        setData({
            name: item.name,
            sku: item.sku || '',
            sub_category_id: item.sub_category_id,
            brand_id: item.brand_id || '',
            base_uom_id: item.base_uom_id,
            description: item.description || '',
            packing_rule_desc: item.packing_rule_desc || '',
            cover_image: null,
            gallery_images: [],
            remove_cover: false,
            remove_gallery_images: [],
            pricing_matrix: item.uom_prices && item.uom_prices.length > 0
                ? item.uom_prices.map(p => ({
                    uom_id: p.uom_id,
                    conversion_factor: parseFloat(p.conversion_factor),
                    selling_price: parseFloat(p.selling_price),
                    mrp: p.mrp ? parseFloat(p.mrp) : '',
                    bulk_discount_price: p.bulk_discount_price ? parseFloat(p.bulk_discount_price) : '',
                    allow_loose_sale: !!p.allow_loose_sale,
                    min_order_qty: parseFloat(p.min_order_qty),
                    step_qty: parseFloat(p.step_qty),
                    pack_contain_qty: p.pack_contain_qty ? parseFloat(p.pack_contain_qty) : '',
                    is_default_selling_unit: !!p.is_default_selling_unit,
                }))
                : [
                    {
                        uom_id: item.base_uom_id,
                        conversion_factor: 1.0,
                        selling_price: '',
                        mrp: '',
                        bulk_discount_price: '',
                        allow_loose_sale: false,
                        min_order_qty: 1,
                        step_qty: 1,
                        pack_contain_qty: '',
                        is_default_selling_unit: true,
                    },
                ],
        });
        setActiveTab('form');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            post(route('admin.catalog.products.update', editingProduct.id), {
                forceFormData: true,
                onSuccess: () => {
                    setActiveTab('list');
                    setEditingProduct(null);
                    reset();
                },
            });
        } else {
            post(route('admin.catalog.products.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setActiveTab('list');
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this product and its images?")) {
            router.delete(route('admin.catalog.products.destroy', id));
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('admin.catalog.products'), {
            search: searchQuery,
            sub_category_id: subCatFilter,
        }, { preserveState: true });
    };

    return (
        <AdminLayout
            title="Product Master & Multi-UOM Matrix"
            breadcrumbs={['Admin', 'Product Master', 'Products & Multi-UOM']}
        >
            <Head title="Products & Multi-UOM Matrix - BuilDeck Admin" />

            {/* Navigation Tabs */}
            <div className="row mb-3">
                <div className="col-12">
                    <ul className="nav nav-pills bg-light p-1 rounded d-inline-flex">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                                onClick={() => setActiveTab('list')}
                            >
                                <i className="ri-stack-line me-1"></i>
                                Products ({products?.total || products?.data?.length || 0})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'form' ? 'active' : ''}`}
                                onClick={() => {
                                    if (!editingProduct) openCreateForm();
                                    else setActiveTab('form');
                                }}
                            >
                                <i className={editingProduct ? "ri-edit-line me-1" : "ri-add-box-line me-1"}></i>
                                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add Product with Multi-UOM & Images"}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* TAB 1: PRODUCT LIST */}
            {activeTab === 'list' && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <form onSubmit={handleFilterSubmit} className="row g-2 align-items-center">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-light"><i className="ri-search-line"></i></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by product name or SKU..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <SearchableSelect
                                    options={[{ id: '', name: 'All Sub-Categories' }, ...subCategories]}
                                    value={subCatFilter}
                                    onChange={(val) => setSubCatFilter(val)}
                                    placeholder="Filter by Sub-Category..."
                                />
                            </div>
                            <div className="col-md-2">
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="ri-filter-line me-1"></i> Filter
                                </button>
                            </div>
                            <div className="col-md-2 text-end">
                                <button type="button" className="btn btn-success w-100" onClick={openCreateForm}>
                                    <i className="ri-add-line me-1"></i> New Product
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '70px' }}>Image</th>
                                        <th>Product Name & SKU</th>
                                        <th>Sub-Category</th>
                                        <th>Brand</th>
                                        <th>Base Unit</th>
                                        <th>Configured Pricing Matrix (UOMs)</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!products?.data || products.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-muted">
                                                <i className="ri-inbox-line fs-32 d-block mb-2"></i>
                                                No products found matching criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.data.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div
                                                        className="rounded border bg-light d-flex align-items-center justify-content-center overflow-hidden"
                                                        style={{ width: '52px', height: '52px' }}
                                                    >
                                                        {product.cover_image_url ? (
                                                            <img
                                                                src={product.cover_image_url}
                                                                alt={product.name}
                                                                className="w-100 h-100 object-fit-cover"
                                                            />
                                                        ) : (
                                                            <i className="ri-image-line text-muted fs-22"></i>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark fs-14">{product.name}</div>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <span className="text-muted fs-12 font-monospace">SKU: {product.sku || '-'}</span>
                                                        {product.gallery_images && product.gallery_images.length > 0 && (
                                                            <span className="badge bg-light text-muted border fs-11">
                                                                <i className="ri-gallery-line me-1"></i>
                                                                {product.gallery_images.length} photos
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {product.sub_category?.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-medium text-primary">
                                                        {product.brand?.name || 'Generic / Unbranded'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-secondary-subtle text-secondary border">
                                                        {product.base_uom?.name} ({product.base_uom?.symbol})
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '420px' }}>
                                                        {product.uom_prices && product.uom_prices.map((p) => (
                                                            <div
                                                                key={p.id}
                                                                className={`p-1 px-2 border rounded fs-11 ${
                                                                    p.is_default_selling_unit
                                                                        ? 'border-primary bg-primary-subtle text-primary fw-bold'
                                                                        : 'bg-light text-dark'
                                                                }`}
                                                            >
                                                                <span>{p.uom?.symbol}: ₹{parseFloat(p.selling_price).toFixed(2)}</span>
                                                                <span className={`badge ms-1 p-0 px-1 ${p.allow_loose_sale ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                                                    {p.allow_loose_sale ? 'Loose' : 'Pack'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => openEditForm(product)}
                                                            title="Edit Product & Matrix"
                                                        >
                                                            <i className="ri-pencil-line"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(product.id)}
                                                            title="Delete"
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
            )}

            {/* TAB 2: CREATE / EDIT MULTI-UOM FORM */}
            {activeTab === 'form' && (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h5 className="card-title mb-0 fw-semibold">
                            <i className="ri-shopping-basket-line me-2 text-primary"></i>
                            {editingProduct ? `Edit Product (${editingProduct.name})` : "Create New Product with Images & Multi-UOM Entry Matrix"}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Section 1: Basic Information */}
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                1. General Product Details
                            </h6>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Product Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. UltraTech Super PPC Cement (50 Kg Bag) or Tata Tiscon 12mm Rebar"
                                        required
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-semibold d-flex align-items-center">
                                        <span>SKU / Code <span className="text-danger">*</span></span>
                                        <InfoTooltip
                                            title="SKU / Unique Code"
                                            content="Product ka unique stock code/model identifier jo warehouse tracking, billing aur ERP sync me use hota hai."
                                            example="ULT-PPC-50KG (Cement), TISCON-12MM-550D (Steel), KAJ-PVT-2X2 (Tiles)"
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.sku ? 'is-invalid' : ''}`}
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        placeholder="e.g. ULT-PPC-50KG"
                                        required
                                    />
                                    {errors.sku && <div className="invalid-feedback">{errors.sku}</div>}
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-semibold">Sub-Category <span className="text-danger">*</span></label>
                                    <SearchableSelect
                                        options={subCategories}
                                        value={data.sub_category_id}
                                        onChange={(val) => handleSubCategoryChange(val)}
                                        placeholder="Search Sub-Category..."
                                        error={errors.sub_category_id}
                                    />
                                    {errors.sub_category_id && <div className="invalid-feedback d-block">{errors.sub_category_id}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Approved Master Brand</label>
                                    <SearchableSelect
                                        options={[{ id: '', name: 'Generic / No Specific Brand' }, ...brands]}
                                        value={data.brand_id}
                                        onChange={(val) => setData('brand_id', val)}
                                        placeholder="Search Brand..."
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold d-flex align-items-center">
                                        <span>Inventory Base UOM <span className="text-danger">*</span></span>
                                        <InfoTooltip
                                            title="Inventory Base UOM"
                                            content="Standardized accounting unit (e.g. Kg, Sq.Ft, Meter, Piece). Sabhi conversions aur internal stock deduction isi unit me calculate hote hain."
                                            example="Steel ka base unit Kg hai; chahe customer Rod khareede ya Tonne, stock Kg me deduct hoga."
                                        />
                                    </label>
                                    <SearchableSelect
                                        options={formattedUoms}
                                        value={data.base_uom_id}
                                        onChange={(val) => setData('base_uom_id', val)}
                                        placeholder="Search Base Unit..."
                                        nameKey="display_name"
                                        valueKey="id"
                                    />
                                    <small className="text-muted fs-11">The standardized internal accounting unit (e.g. Kg, Sq.Ft, Meter, Piece)</small>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold d-flex align-items-center">
                                        <span>Packing / Sizing Rule</span>
                                        <InfoTooltip
                                            title="Packing / Sizing Rule"
                                            content="Customer, transporter aur labor ko batata hai ki material factory se kis packaging form aur size me pack hokar aayega."
                                            example="Tiles: 1 Box = 16 Sq. Ft. Coverage | Cement: Standard 50 Kg Moisture-Proof Bag | Pipes: 10ft Length"
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={data.packing_rule_desc}
                                        onChange={(e) => setData('packing_rule_desc', e.target.value)}
                                        placeholder="e.g. Standard 50 Kg Moisture-Proof Bag"
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Product Description</label>
                                    <textarea
                                        rows="2"
                                        className="form-control"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Key features, applications, durability details..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section 2: Product Images & Media */}
                            <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                                2. Product Images (Cover & Gallery)
                            </h6>

                            <div className="row g-3 mb-4">
                                {/* Cover Image Upload */}
                                <div className="col-md-5">
                                    <div className="border rounded p-3 bg-light h-100">
                                        <label className="form-label fw-semibold d-flex justify-content-between align-items-center">
                                            <span><i className="ri-image-line me-1 text-primary"></i> Main Cover Image</span>
                                            {coverPreview && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                                                    onClick={handleRemoveCover}
                                                >
                                                    <i className="ri-delete-bin-line"></i> Remove
                                                </button>
                                            )}
                                        </label>

                                        {coverPreview ? (
                                            <div className="position-relative text-center border rounded bg-white p-2 mb-2">
                                                <img
                                                    src={coverPreview}
                                                    alt="Cover preview"
                                                    className="rounded img-fluid"
                                                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border border-dashed rounded p-4 text-center bg-white mb-2 text-muted">
                                                <i className="ri-upload-cloud-2-line fs-32 text-primary d-block mb-1"></i>
                                                <span className="fs-13">Upload product cover photo</span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={`form-control ${errors.cover_image ? 'is-invalid' : ''}`}
                                            onChange={handleCoverImageChange}
                                        />
                                        <small className="text-muted fs-11">Recommended: 800x800px or 1:1 ratio. Max 5MB (JPG, PNG, WebP).</small>
                                        {errors.cover_image && <div className="invalid-feedback">{errors.cover_image}</div>}
                                    </div>
                                </div>

                                {/* Gallery Images Upload */}
                                <div className="col-md-7">
                                    <div className="border rounded p-3 bg-light h-100">
                                        <label className="form-label fw-semibold">
                                            <i className="ri-gallery-line me-1 text-primary"></i> Product Gallery Photos (Multiple)
                                        </label>

                                        {/* Gallery Thumbnails Grid */}
                                        <div className="d-flex flex-wrap gap-2 mb-3" style={{ minHeight: '90px' }}>
                                            {/* Existing gallery thumbnails */}
                                            {existingGallery.map((item) => (
                                                <div
                                                    key={item.path}
                                                    className="position-relative border rounded bg-white p-1"
                                                    style={{ width: '80px', height: '80px' }}
                                                >
                                                    <img
                                                        src={item.url}
                                                        alt="Gallery item"
                                                        className="w-100 h-100 rounded object-fit-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm p-0 rounded-circle position-absolute top-0 end-0 m-1"
                                                        style={{ width: '20px', height: '20px', lineHeight: '18px' }}
                                                        onClick={() => handleRemoveExistingGalleryImage(item.path)}
                                                        title="Delete from gallery"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Newly selected gallery previews */}
                                            {galleryPreviews.map((preview, idx) => (
                                                <div
                                                    key={idx}
                                                    className="position-relative border border-primary rounded bg-white p-1"
                                                    style={{ width: '80px', height: '80px' }}
                                                >
                                                    <img
                                                        src={preview.url}
                                                        alt={`New preview ${idx}`}
                                                        className="w-100 h-100 rounded object-fit-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm p-0 rounded-circle position-absolute top-0 end-0 m-1"
                                                        style={{ width: '20px', height: '20px', lineHeight: '18px' }}
                                                        onClick={() => handleRemoveNewGalleryImage(idx)}
                                                        title="Remove"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}

                                            {existingGallery.length === 0 && galleryPreviews.length === 0 && (
                                                <div className="w-100 border border-dashed rounded p-3 text-center bg-white text-muted">
                                                    <i className="ri-image-add-line fs-24 d-block text-muted mb-1"></i>
                                                    <span className="fs-12">No gallery images added yet</span>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="form-control"
                                            onChange={handleGalleryImagesChange}
                                        />
                                        <small className="text-muted fs-11">You can select multiple photos at once for angles, packaging, certifications.</small>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Multi-UOM & Loose Sale Matrix */}
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                <div>
                                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                                        <span>3. Multi-UOM Pricing & Loose-Sale Control Matrix</span>
                                        <InfoTooltip
                                            title="Multi-UOM & Loose-Sale Control Matrix"
                                            content="Customer ko alag-alag units me khareedne ka option deta hai (jaise Steel ko Kg, Tonne ya Rod me bechna) aur packaging break hone se roktah hai."
                                            example="Cement me 50kg bag ka rate ₹380 aur 1 Tonne ka ₹7400 alag-alag set kar sakte hain."
                                            placement="bottom"
                                        />
                                    </h6>
                                    <small className="text-muted">
                                        Define unit-wise price tiers and whether each unit can be sold as loose or in sealed full packs only.
                                    </small>
                                </div>
                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addMatrixRow}>
                                    <i className="ri-add-line me-1"></i> Add Unit Tier
                                </button>
                            </div>

                            <div className="table-responsive mb-4" style={{ overflow: 'visible' }}>
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light fs-13">
                                        <tr>
                                            <th style={{ minWidth: '190px' }}>UOM (Selling Unit) <span className="text-danger">*</span></th>
                                            <th style={{ width: '130px' }}>Selling Price (₹) <span className="text-danger">*</span></th>
                                            <th style={{ width: '110px' }}>MRP (₹)</th>
                                            <th style={{ width: '140px' }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span>Factor to Base</span>
                                                    <InfoTooltip
                                                        title="Conversion Factor"
                                                        content="Is selling unit ka Base Unit ke sath multiplier. 1 Selling Unit = Kitne Base Units."
                                                        example="Base Unit: Kg. Agar Unit: Tonne hai toh Factor = 1000. Agar 12mm Rod hai toh Factor = 10.66."
                                                        placement="bottom"
                                                    />
                                                </div>
                                            </th>
                                            <th style={{ width: '170px' }} className="text-center">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <span>Sell as Loose?</span>
                                                    <InfoTooltip
                                                        title="Sell as Loose or Not?"
                                                        content="Decide karta hai ki kya dukandaar is pack ko khol kar khula bech sakta hai ya sirf sealed full pack bechega."
                                                        example="Cement Bag = NO (khula cement kharab hoga). Tiles Box = NO (tootne ka risk). Steel Rod / Sand Cft = YES."
                                                        placement="bottom"
                                                    />
                                                </div>
                                            </th>
                                            <th style={{ width: '100px' }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span>MOQ</span>
                                                    <InfoTooltip
                                                        title="Minimum Order Quantity (MOQ)"
                                                        content="Customer is unit me kam se kam kitni quantity khareed sakta hai."
                                                        example="Bricks: MOQ = 1000 Pcs | Cement: MOQ = 1 Bag | Sand: MOQ = 10 Cft"
                                                        placement="bottom"
                                                    />
                                                </div>
                                            </th>
                                            <th style={{ width: '120px' }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span>Step / Multiplier</span>
                                                    <InfoTooltip
                                                        title="Step / Quantity Multiplier"
                                                        content="Cart me quantity kitne-kitne ke gap me badhegi (+ / -). Fractional ya odd count rokne ke liye."
                                                        example="Bricks: Step = 500 (Customer 1000, 1500, 2000 order karega). Tiles: Step = 1 (Full Box)."
                                                        placement="bottom"
                                                    />
                                                </div>
                                            </th>
                                            <th style={{ width: '120px' }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <span>Pack Contains</span>
                                                    <InfoTooltip
                                                        title="Pack Contains Quantity"
                                                        content="Ek pack ke andar kitna coverage area, weight ya count hota hai."
                                                        example="Tile Box me 16 Sq. Ft., Cement Bag me 50 Kg, Wire Coil me 90 Metre."
                                                        placement="bottom"
                                                    />
                                                </div>
                                            </th>
                                            <th style={{ width: '80px' }} className="text-center">Default</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.pricing_matrix.map((row, index) => (
                                            <tr key={index} className={row.is_default_selling_unit ? 'table-primary-subtle' : ''}>
                                                <td style={{ minWidth: '190px' }}>
                                                    <SearchableSelect
                                                        options={formattedUoms}
                                                        value={row.uom_id}
                                                        onChange={(val) => updateMatrixRow(index, 'uom_id', val)}
                                                        placeholder="Search Unit..."
                                                        nameKey="display_name"
                                                        valueKey="id"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        placeholder="0.00"
                                                        value={row.selling_price}
                                                        onChange={(e) => updateMatrixRow(index, 'selling_price', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        placeholder="0.00"
                                                        value={row.mrp}
                                                        onChange={(e) => updateMatrixRow(index, 'mrp', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.0001"
                                                        className="form-control form-control-sm"
                                                        placeholder="1.0"
                                                        value={row.conversion_factor}
                                                        onChange={(e) => updateMatrixRow(index, 'conversion_factor', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <div className="form-check form-switch d-inline-block">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id={`looseSwitch_${index}`}
                                                            checked={row.allow_loose_sale}
                                                            onChange={(e) => updateMatrixRow(index, 'allow_loose_sale', e.target.checked)}
                                                        />
                                                        <label className="form-check-label fs-12 ms-1" htmlFor={`looseSwitch_${index}`}>
                                                            {row.allow_loose_sale ? (
                                                                <span className="text-success fw-semibold">Yes (Loose)</span>
                                                            ) : (
                                                                <span className="text-danger fw-semibold">No (Full Pack)</span>
                                                            )}
                                                        </label>
                                                    </div>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        value={row.min_order_qty}
                                                        onChange={(e) => updateMatrixRow(index, 'min_order_qty', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        value={row.step_qty}
                                                        onChange={(e) => updateMatrixRow(index, 'step_qty', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control form-control-sm"
                                                        placeholder="e.g. 16, 50"
                                                        value={row.pack_contain_qty}
                                                        onChange={(e) => updateMatrixRow(index, 'pack_contain_qty', e.target.value)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="radio"
                                                        name="default_selling_unit"
                                                        className="form-check-input"
                                                        checked={row.is_default_selling_unit}
                                                        onChange={() => updateMatrixRow(index, 'is_default_selling_unit', true)}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm p-1"
                                                        onClick={() => removeMatrixRow(index)}
                                                        disabled={data.pricing_matrix.length <= 1}
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-end">
                                <button
                                    type="button"
                                    className="btn btn-light me-2"
                                    onClick={() => setActiveTab('list')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    <i className="ri-save-line me-1"></i>
                                    {editingProduct ? 'Update Product & Images' : 'Save Product & Images'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
