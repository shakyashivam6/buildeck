import AdminLayout from "@/Layouts/AdminLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import InfoTooltip from "@/Components/InfoTooltip";
import FormTrainingModal, { FormTrainingButton } from "@/Components/FormTrainingModal";
import { Head, useForm, router, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";

export default function VendorStocksIndex({
    vendorProducts = { data: [] },
    ledgers = { data: [] },
    vendors = [],
    masterProducts = [],
    unitsOfMeasure = [],
    filters = {},
}) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'inventory'); // 'inventory' | 'ledger'

    // Formatted dropdown options with search capabilities
    const vendorFilterOptions = useMemo(() => [
        { id: '', name: 'All Approved Vendors' },
        ...vendors.map((v) => ({
            id: v.id,
            name: `${v.vendor_name} (${v.owner_name})`,
        })),
    ], [vendors]);

    const stockStatusOptions = [
        { id: '', name: 'All Statuses' },
        { id: 'in_stock', name: 'In Stock (> 0)' },
        { id: 'out_of_stock', name: 'Out of Stock (= 0)' },
        { id: 'hidden', name: 'Hidden / Inactive' },
    ];

    const ledgerVendorOptions = useMemo(() => [
        { id: '', name: 'All Vendors' },
        ...vendors.map((v) => ({
            id: v.id,
            name: v.vendor_name,
        })),
    ], [vendors]);

    const ledgerTypeOptions = [
        { id: '', name: 'All Types' },
        { id: 'opening_stock', name: 'Opening Stock' },
        { id: 'stock_inward', name: 'Stock Inward / Shipment' },
        { id: 'order_deduct', name: 'Order Deduct' },
        { id: 'order_cancelled_restock', name: 'Order Cancelled Restock' },
        { id: 'manual_audit_adjustment', name: 'Manual Audit Adjustment' },
        { id: 'damage_loss', name: 'Damage / Breakage Loss' },
    ];

    const ledgerFlowOptions = [
        { id: '', name: 'All Flows' },
        { id: 'inward', name: 'Inward (+)' },
        { id: 'outward', name: 'Outward (-)' },
    ];

    const vendorAssignOptions = useMemo(() => {
        return vendors.map((v) => ({
            id: v.id,
            name: `${v.vendor_name} (${v.owner_name})`,
        }));
    }, [vendors]);

    const productAssignOptions = useMemo(() => {
        return masterProducts.map((p) => ({
            id: p.id,
            name: `${p.name} [${p.sku || 'No SKU'}] (${p.base_uom?.name || 'Unit'})`,
        }));
    }, [masterProducts]);

    const formattedUoms = useMemo(() => {
        return unitsOfMeasure.map((u) => ({
            id: u.id,
            name: `${u.name} (${u.symbol})`,
            display_name: `${u.name} (${u.symbol})`,
            symbol: u.symbol,
        }));
    }, [unitsOfMeasure]);

    // Filter states
    const [selectedVendor, setSelectedVendor] = useState(filters.vendor_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Ledger Filter states
    const [ledgerVendor, setLedgerVendor] = useState(filters.ledger_vendor_id || '');
    const [ledgerType, setLedgerType] = useState(filters.ledger_type || '');
    const [ledgerFlow, setLedgerFlow] = useState(filters.ledger_flow || '');

    // Modals
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVP, setSelectedVP] = useState(null);

    // Training Guide Modals
    const [showAssignTraining, setShowAssignTraining] = useState(false);
    const [showStockInwardTraining, setShowStockInwardTraining] = useState(false);

    // Form 1: Assign Product
    const assignForm = useForm({
        vendor_id: '',
        product_id: '',
        stock: '0',
        stock_uom_id: '',
        notes: '',
        pricing_matrix: [],
    });

    // Form 2: Quick Add Stock
    const addStockForm = useForm({
        quantity_to_add: '',
        stock_uom_id: '',
        challan_or_invoice_no: '',
        notes: '',
    });

    // Form 3: Edit Stock & Price
    const editForm = useForm({
        amount: '',
        mrp: '',
        stock: '',
        min_order_qty: '',
        reason: '',
        pricing_matrix: [],
    });

    // Helper: currently selected master product in assign modal
    const selectedMasterProduct = useMemo(() => {
        if (!assignForm.data.product_id) return null;
        return masterProducts.find((p) => p.id === parseInt(assignForm.data.product_id)) || null;
    }, [assignForm.data.product_id, masterProducts]);

    const stockReceivingUnitOptions = useMemo(() => {
        if (assignForm.data.pricing_matrix.length > 0) {
            return assignForm.data.pricing_matrix.map((r) => {
                const uomObj = unitsOfMeasure.find((u) => u.id === parseInt(r.uom_id));
                const factorStr = parseFloat(r.conversion_factor) !== 1 ? ` [×${r.conversion_factor} base]` : ' [Base Unit]';
                return {
                    id: r.uom_id,
                    name: uomObj ? `${uomObj.name} (${uomObj.symbol})${factorStr}` : `Unit #${r.uom_id}${factorStr}`,
                };
            });
        }
        return selectedMasterProduct?.base_uom ? [{
            id: selectedMasterProduct.base_uom_id,
            name: `${selectedMasterProduct.base_uom.name} (${selectedMasterProduct.base_uom.symbol}) [Base Unit]`,
        }] : [];
    }, [assignForm.data.pricing_matrix, unitsOfMeasure, selectedMasterProduct]);

    // When Master Product is chosen in Assign Modal
    const handleAssignProductSelect = (productId) => {
        const product = masterProducts.find((p) => p.id === parseInt(productId));
        if (!product) {
            assignForm.setData({
                ...assignForm.data,
                product_id: productId,
                stock_uom_id: '',
                pricing_matrix: [],
            });
            return;
        }

        let matrixRows = [];
        if (product.uom_prices && product.uom_prices.length > 0) {
            matrixRows = product.uom_prices.map((pRow) => ({
                uom_id: pRow.uom_id,
                conversion_factor: pRow.conversion_factor,
                selling_price: pRow.selling_price || '',
                mrp: pRow.mrp || '',
                allow_loose_sale: Boolean(pRow.allow_loose_sale),
                min_order_qty: pRow.min_order_qty || '1',
                step_qty: pRow.step_qty || '1',
                pack_contain_qty: pRow.pack_contain_qty || '',
                is_default_selling_unit: Boolean(pRow.is_default_selling_unit),
            }));
        } else {
            matrixRows = [{
                uom_id: product.base_uom_id,
                conversion_factor: 1.0,
                selling_price: '',
                mrp: '',
                allow_loose_sale: true,
                min_order_qty: '1',
                step_qty: '1',
                pack_contain_qty: '',
                is_default_selling_unit: true,
            }];
        }

        const defaultRow = matrixRows.find((r) => r.is_default_selling_unit) || matrixRows[0];

        assignForm.setData({
            ...assignForm.data,
            product_id: productId,
            stock_uom_id: defaultRow ? defaultRow.uom_id : (product.base_uom_id || ''),
            pricing_matrix: matrixRows,
        });
    };

    // Matrix manipulation for Assign Form
    const updateAssignMatrixRow = (index, field, value) => {
        const updated = [...assignForm.data.pricing_matrix];
        if (field === 'is_default_selling_unit' && value === true) {
            updated.forEach((r, i) => {
                r.is_default_selling_unit = i === index;
            });
        } else {
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
        }
        assignForm.setData('pricing_matrix', updated);
    };

    const addAssignMatrixRow = () => {
        const defaultUomId = formattedUoms.length > 0 ? formattedUoms[0].id : '';
        assignForm.setData('pricing_matrix', [
            ...assignForm.data.pricing_matrix,
            {
                uom_id: defaultUomId,
                conversion_factor: 1.0,
                selling_price: '',
                mrp: '',
                allow_loose_sale: false,
                min_order_qty: '1',
                step_qty: '1',
                pack_contain_qty: '',
                is_default_selling_unit: false,
            },
        ]);
    };

    const removeAssignMatrixRow = (index) => {
        if (assignForm.data.pricing_matrix.length <= 1) return;
        const updated = assignForm.data.pricing_matrix.filter((_, i) => i !== index);
        if (!updated.some((r) => r.is_default_selling_unit) && updated.length > 0) {
            updated[0].is_default_selling_unit = true;
        }
        assignForm.setData('pricing_matrix', updated);
    };

    const setAllAssignLoose = (allow) => {
        const updated = assignForm.data.pricing_matrix.map((row) => ({
            ...row,
            allow_loose_sale: allow,
        }));
        assignForm.setData('pricing_matrix', updated);
    };

    // Calculate equivalent base inventory in Assign Form
    const assignCalculatedBaseStock = useMemo(() => {
        const qty = parseFloat(assignForm.data.stock) || 0;
        if (!assignForm.data.stock_uom_id || !assignForm.data.pricing_matrix.length) {
            return qty.toFixed(2);
        }
        const row = assignForm.data.pricing_matrix.find((r) => parseInt(r.uom_id) === parseInt(assignForm.data.stock_uom_id));
        const factor = row ? parseFloat(row.conversion_factor) || 1 : 1;
        return (qty * factor).toFixed(2);
    }, [assignForm.data.stock, assignForm.data.stock_uom_id, assignForm.data.pricing_matrix]);

    // Matrix manipulation for Edit Form
    const updateEditMatrixRow = (index, field, value) => {
        const updated = [...editForm.data.pricing_matrix];
        if (field === 'is_default_selling_unit' && value === true) {
            updated.forEach((r, i) => {
                r.is_default_selling_unit = i === index;
            });
        } else {
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
        }
        editForm.setData('pricing_matrix', updated);
    };

    const addEditMatrixRow = () => {
        const defaultUomId = formattedUoms.length > 0 ? formattedUoms[0].id : '';
        editForm.setData('pricing_matrix', [
            ...editForm.data.pricing_matrix,
            {
                uom_id: defaultUomId,
                conversion_factor: 1.0,
                selling_price: '',
                mrp: '',
                allow_loose_sale: false,
                min_order_qty: '1',
                step_qty: '1',
                pack_contain_qty: '',
                is_default_selling_unit: false,
            },
        ]);
    };

    const removeEditMatrixRow = (index) => {
        if (editForm.data.pricing_matrix.length <= 1) return;
        const updated = editForm.data.pricing_matrix.filter((_, i) => i !== index);
        if (!updated.some((r) => r.is_default_selling_unit) && updated.length > 0) {
            updated[0].is_default_selling_unit = true;
        }
        editForm.setData('pricing_matrix', updated);
    };

    const setAllEditLoose = (allow) => {
        const updated = editForm.data.pricing_matrix.map((row) => ({
            ...row,
            allow_loose_sale: allow,
        }));
        editForm.setData('pricing_matrix', updated);
    };

    // Filter handlers
    const applyInventoryFilters = () => {
        router.get(route('admin.catalog.vendor-stocks'), {
            tab: 'inventory',
            vendor_id: selectedVendor,
            status: selectedStatus,
            search: searchQuery,
        }, { preserveState: true, replace: true });
    };

    const applyLedgerFilters = () => {
        router.get(route('admin.catalog.vendor-stocks'), {
            tab: 'ledger',
            ledger_vendor_id: ledgerVendor,
            ledger_type: ledgerType,
            ledger_flow: ledgerFlow,
        }, { preserveState: true, replace: true });
    };

    const resetInventoryFilters = () => {
        setSelectedVendor('');
        setSelectedStatus('');
        setSearchQuery('');
        router.get(route('admin.catalog.vendor-stocks'), { tab: 'inventory' });
    };

    const resetLedgerFilters = () => {
        setLedgerVendor('');
        setLedgerType('');
        setLedgerFlow('');
        router.get(route('admin.catalog.vendor-stocks'), { tab: 'ledger' });
    };

    // Modal openers
    const openAddStockModal = (vp) => {
        setSelectedVP(vp);
        addStockForm.reset();
        addStockForm.setData({
            quantity_to_add: '',
            stock_uom_id: vp.product?.base_uom_id || '',
            challan_or_invoice_no: '',
            notes: '',
        });
        setIsAddStockModalOpen(true);
    };

    const openEditModal = (vp) => {
        setSelectedVP(vp);
        let matrixRows = [];
        if (vp.uom_prices && vp.uom_prices.length > 0) {
            matrixRows = vp.uom_prices.map((row) => ({
                uom_id: row.uom_id,
                conversion_factor: row.conversion_factor,
                selling_price: row.selling_price || '',
                mrp: row.mrp || '',
                allow_loose_sale: Boolean(row.allow_loose_sale),
                min_order_qty: row.min_order_qty || '1',
                step_qty: row.step_qty || '1',
                pack_contain_qty: row.pack_contain_qty || '',
                is_default_selling_unit: Boolean(row.is_default_selling_unit),
            }));
        } else if (vp.product?.uom_prices && vp.product.uom_prices.length > 0) {
            matrixRows = vp.product.uom_prices.map((row) => ({
                uom_id: row.uom_id,
                conversion_factor: row.conversion_factor,
                selling_price: vp.amount ? (parseFloat(vp.amount) * parseFloat(row.conversion_factor)).toFixed(2) : (row.selling_price || ''),
                mrp: row.mrp || '',
                allow_loose_sale: Boolean(row.allow_loose_sale),
                min_order_qty: row.min_order_qty || '1',
                step_qty: row.step_qty || '1',
                pack_contain_qty: row.pack_contain_qty || '',
                is_default_selling_unit: Boolean(row.is_default_selling_unit),
            }));
        } else {
            matrixRows = [{
                uom_id: vp.product?.base_uom_id,
                conversion_factor: 1.0,
                selling_price: vp.amount || '',
                mrp: vp.mrp || '',
                allow_loose_sale: true,
                min_order_qty: vp.min_order_qty || '1',
                step_qty: '1',
                pack_contain_qty: '',
                is_default_selling_unit: true,
            }];
        }

        editForm.setData({
            amount: vp.amount || '',
            mrp: vp.mrp || '',
            stock: vp.stock || '',
            min_order_qty: vp.min_order_qty || '1',
            reason: '',
            pricing_matrix: matrixRows,
        });
        setIsEditModalOpen(true);
    };

    // Submissions
    const handleAssignSubmit = (e) => {
        e.preventDefault();
        assignForm.post(route('admin.catalog.vendor-stocks.store'), {
            onSuccess: () => {
                setIsAssignModalOpen(false);
                assignForm.reset();
            },
        });
    };

    const handleAddStockSubmit = (e) => {
        e.preventDefault();
        if (!selectedVP) return;
        addStockForm.post(route('admin.catalog.vendor-stocks.add-stock', selectedVP.id), {
            onSuccess: () => {
                setIsAddStockModalOpen(false);
                addStockForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedVP) return;
        editForm.post(route('admin.catalog.vendor-stocks.update', selectedVP.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
            },
        });
    };

    const toggleStatus = (vp) => {
        if (confirm(`Change availability status for ${vp.product?.name}?`)) {
            router.post(route('admin.catalog.vendor-stocks.toggle-status', vp.id));
        }
    };

    return (
        <AdminLayout title="Vendor Stock & Pricing Management" breadcrumbs={[
            { label: 'Catalog', url: '#' },
            { label: 'Vendor Stock & Ledger', url: route('admin.catalog.vendor-stocks') },
        ]}>
            <Head title="Vendor Stock & Ledger Management" />

            <div className="card mb-4 shadow-sm">
                <div className="card-header border-bottom bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                        <h4 className="card-title mb-1 fw-bold text-primary">Vendor Stock & Inventory Ledger</h4>
                        <p className="text-muted small mb-0">Control vendor inventory, multi-UOM packaging rules, loose-sale toggles, and transaction audit trails.</p>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-sm ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            <i className="ri-store-2-line me-1"></i> Vendor Inventory
                        </button>
                        <button
                            className={`btn btn-sm ${activeTab === 'ledger' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('ledger')}
                        >
                            <i className="ri-file-list-3-line me-1"></i> Stock Ledger (Audit)
                        </button>
                        {activeTab === 'inventory' && (
                            <div className="d-flex align-items-center gap-2">
                                <FormTrainingButton
                                    onClick={() => setShowAssignTraining(true)}
                                    label="Assignment Guide"
                                />
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => {
                                        assignForm.reset();
                                        assignForm.setData({
                                            vendor_id: '',
                                            product_id: '',
                                            stock: '0',
                                            stock_uom_id: '',
                                            notes: '',
                                            pricing_matrix: [],
                                        });
                                        setIsAssignModalOpen(true);
                                    }}
                                >
                                    <i className="ri-add-line me-1"></i> Assign Product to Vendor
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* TAB 1: VENDOR INVENTORY */}
                {activeTab === 'inventory' && (
                    <div className="card-body">
                        {/* Filter Bar */}
                        <div className="row g-2 mb-3 bg-body-secondary p-3 rounded align-items-end">
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Filter by Vendor</label>
                                <SearchableSelect
                                    options={vendorFilterOptions}
                                    value={selectedVendor}
                                    onChange={(val) => setSelectedVendor(val)}
                                    placeholder="All Approved Vendors"
                                    size="sm"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Stock Status</label>
                                <SearchableSelect
                                    options={stockStatusOptions}
                                    value={selectedStatus}
                                    onChange={(val) => setSelectedStatus(val)}
                                    placeholder="All Statuses"
                                    size="sm"
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-semibold">Search Product or Vendor</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Product name, SKU, or vendor..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyInventoryFilters()}
                                />
                            </div>

                            <div className="col-md-2 d-flex gap-1">
                                <button className="btn btn-sm btn-primary flex-fill" onClick={applyInventoryFilters}>
                                    <i className="ri-search-line me-1"></i> Filter
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={resetInventoryFilters} title="Reset">
                                    <i className="ri-refresh-line"></i>
                                </button>
                            </div>
                        </div>

                        {/* Inventory Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-body-secondary small text-uppercase">
                                    <tr>
                                        <th>Product</th>
                                        <th>Vendor</th>
                                        <th>Base Stock</th>
                                        <th>Selling Units & Loose Rules</th>
                                        <th>Default Selling Rate</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorProducts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No vendor products found. Click "Assign Product to Vendor" to add inventory.
                                            </td>
                                        </tr>
                                    ) : (
                                        vendorProducts.data.map((vp) => {
                                            const stockNum = parseFloat(vp.stock) || 0;
                                            const uomList = (vp.uom_prices && vp.uom_prices.length > 0)
                                                ? vp.uom_prices
                                                : (vp.product?.uom_prices || []);

                                            return (
                                                <tr key={vp.id}>
                                                    <td>
                                                        <div className="fw-semibold text-body">{vp.product?.name}</div>
                                                        <span className="badge bg-body-secondary text-body-secondary border">SKU: {vp.product?.sku || 'N/A'}</span>
                                                    </td>
                                                    <td>
                                                        <div className="fw-medium text-primary">{vp.vendor?.vendor_name}</div>
                                                        <small className="text-muted">{vp.vendor?.owner_name} ({vp.vendor?.mobile})</small>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <span className={`badge fs-6 ${stockNum > 10 ? 'bg-success-subtle text-success' : stockNum > 0 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                                                                {stockNum.toFixed(2)} {vp.product?.base_uom?.symbol}
                                                            </span>
                                                            <small className="text-muted mt-1 fs-11">
                                                                Base: {vp.product?.base_uom?.name}
                                                            </small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '300px' }}>
                                                            {uomList.length === 0 ? (
                                                                <span className="badge bg-body-secondary text-body border">
                                                                    {vp.product?.base_uom?.name || 'Base Unit'} (₹{parseFloat(vp.amount).toFixed(2)})
                                                                </span>
                                                            ) : (
                                                                uomList.map((uRow) => (
                                                                    <span
                                                                        key={uRow.id || uRow.uom_id}
                                                                        className={`badge py-1 px-2 border ${uRow.allow_loose_sale ? 'bg-success-subtle text-success border-success-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}
                                                                        title={uRow.allow_loose_sale ? 'Loose sale allowed' : 'Full Package only'}
                                                                    >
                                                                        <i className={uRow.allow_loose_sale ? 'ri-scales-line me-1' : 'ri-archive-line me-1'}></i>
                                                                        <strong>{uRow.uom?.name || 'Unit'}</strong>: ₹{parseFloat(uRow.selling_price || vp.amount).toFixed(2)}
                                                                        <span className="ms-1 fs-10 opacity-75">
                                                                            ({uRow.allow_loose_sale ? 'Loose' : 'Pack'})
                                                                        </span>
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-body fs-14">₹{parseFloat(vp.amount).toFixed(2)}</div>
                                                        {vp.mrp && (
                                                            <small className="text-muted text-decoration-line-through fs-11">MRP: ₹{parseFloat(vp.mrp).toFixed(2)}</small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${vp.is_available ? 'bg-success' : 'bg-secondary'}`}>
                                                            {vp.is_available ? 'In Stock / Live' : 'Hidden'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm">
                                                            <button
                                                                className="btn btn-outline-success"
                                                                title="Quick Add Stock (+Arrival)"
                                                                onClick={() => openAddStockModal(vp)}
                                                            >
                                                                <i className="ri-add-circle-line me-1"></i> +Stock
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                title="Edit Price & Packaging Rules"
                                                                onClick={() => openEditModal(vp)}
                                                            >
                                                                <i className="ri-edit-line me-1"></i> Manage
                                                            </button>
                                                            <button
                                                                className={`btn ${vp.is_available ? 'btn-outline-warning' : 'btn-outline-info'}`}
                                                                title={vp.is_available ? 'Hide product from store' : 'Make available in store'}
                                                                onClick={() => toggleStatus(vp)}
                                                            >
                                                                <i className={vp.is_available ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {vendorProducts.links && vendorProducts.links.length > 3 && (
                            <div className="d-flex justify-content-end mt-3">
                                <ul className="pagination pagination-sm mb-0">
                                    {vendorProducts.links.map((link, idx) => (
                                        <li key={idx} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                                            <Link className="page-link" href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: AUDIT STOCK LEDGER */}
                {activeTab === 'ledger' && (
                    <div className="card-body">
                        {/* Filter Bar */}
                        <div className="row g-2 mb-3 bg-body-secondary p-3 rounded align-items-end">
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Vendor</label>
                                <SearchableSelect
                                    options={ledgerVendorOptions}
                                    value={ledgerVendor}
                                    onChange={(val) => setLedgerVendor(val)}
                                    placeholder="All Vendors"
                                    size="sm"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Transaction Type</label>
                                <SearchableSelect
                                    options={ledgerTypeOptions}
                                    value={ledgerType}
                                    onChange={(val) => setLedgerType(val)}
                                    placeholder="All Types"
                                    size="sm"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Flow</label>
                                <SearchableSelect
                                    options={ledgerFlowOptions}
                                    value={ledgerFlow}
                                    onChange={(val) => setLedgerFlow(val)}
                                    placeholder="All Flows"
                                    size="sm"
                                />
                            </div>

                            <div className="col-md-3 d-flex gap-1">
                                <button className="btn btn-sm btn-primary flex-fill" onClick={applyLedgerFilters}>
                                    <i className="ri-filter-3-line me-1"></i> Apply Filter
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={resetLedgerFilters} title="Reset">
                                    <i className="ri-refresh-line"></i>
                                </button>
                            </div>
                        </div>

                        {/* Ledger Passbook Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-body-secondary small text-uppercase">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Product</th>
                                        <th>Vendor</th>
                                        <th>Transaction Type</th>
                                        <th className="text-end">Balance Before</th>
                                        <th className="text-end">Movement (Qty)</th>
                                        <th className="text-end">Balance After</th>
                                        <th>Ref / Notes</th>
                                        <th>Action By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgers.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4 text-muted">
                                                No stock movements recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        ledgers.data.map((row) => {
                                            const isInward = row.flow === 'inward';
                                            return (
                                                <tr key={row.id}>
                                                    <td className="small text-muted">
                                                        {new Date(row.created_at).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </td>
                                                    <td>
                                                        <span className="fw-semibold text-body">{row.product?.name}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-primary">{row.vendor?.vendor_name}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-body-secondary text-body border">
                                                            {row.transaction_type.replace(/_/g, ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="text-end font-monospace">
                                                        {parseFloat(row.balance_before).toFixed(2)}
                                                    </td>
                                                    <td className={`text-end font-monospace fw-bold ${isInward ? 'text-success' : 'text-danger'}`}>
                                                        {isInward ? '+' : '-'}{parseFloat(row.quantity).toFixed(2)} {row.product?.base_uom?.symbol}
                                                    </td>
                                                    <td className="text-end font-monospace fw-bold text-body">
                                                        {parseFloat(row.balance_after).toFixed(2)}
                                                    </td>
                                                    <td className="small">
                                                        <div className="text-body fw-medium">{row.reference_number || '-'}</div>
                                                        <div className="text-muted">{row.notes || ''}</div>
                                                    </td>
                                                    <td className="small text-muted">
                                                        {row.created_by?.name || 'System / Vendor'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {ledgers.links && ledgers.links.length > 3 && (
                            <div className="d-flex justify-content-end mt-3">
                                <ul className="pagination pagination-sm mb-0">
                                    {ledgers.links.map((link, idx) => (
                                        <li key={idx} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                                            <Link className="page-link" href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL 1: ASSIGN PRODUCT TO VENDOR (WITH MULTI-UOM & LOOSE/PACKAGE MATRIX) */}
            {isAssignModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered my-3" style={{ maxHeight: '92vh' }}>
                        <div className="modal-content shadow-lg border-0 d-flex flex-column" style={{ maxHeight: '92vh', overflow: 'hidden' }}>
                            <form onSubmit={handleAssignSubmit} className="d-flex flex-column flex-grow-1" style={{ minHeight: 0, maxHeight: '92vh' }}>
                                <div className="modal-header bg-primary text-white py-3 flex-shrink-0 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0 text-white">
                                            <i className="ri-store-3-line me-2"></i>Assign Product to Vendor
                                        </h5>
                                        <small className="opacity-75">Configure vendor inventory, multi-UOM rates, and loose-sale packaging rules</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FormTrainingButton
                                            onClick={() => setShowAssignTraining(true)}
                                            label="Assignment Guide"
                                            className="btn btn-light btn-sm text-primary fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                                        />
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setIsAssignModalOpen(false)}></button>
                                    </div>
                                </div>
                                <div className="modal-body p-4 flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                                    {/* Section 1: Vendor & Master Product */}
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-body">Select Vendor *</label>
                                            <SearchableSelect
                                                options={vendorAssignOptions}
                                                value={assignForm.data.vendor_id}
                                                onChange={(val) => assignForm.setData('vendor_id', val)}
                                                placeholder="-- Choose Approved Vendor --"
                                                error={assignForm.errors.vendor_id}
                                            />
                                            {assignForm.errors.vendor_id && (
                                                <div className="text-danger fs-12 mt-1">{assignForm.errors.vendor_id}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-body">Select Master Product *</label>
                                            <SearchableSelect
                                                options={productAssignOptions}
                                                value={assignForm.data.product_id}
                                                onChange={(val) => handleAssignProductSelect(val)}
                                                placeholder="-- Choose Master Product --"
                                                error={assignForm.errors.product_id}
                                            />
                                            {assignForm.errors.product_id && (
                                                <div className="text-danger fs-12 mt-1">{assignForm.errors.product_id}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Details Header & Base Unit Notice */}
                                    {selectedMasterProduct && (
                                        <div className="p-3 mb-3 bg-body-secondary border rounded d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div>
                                                <span className="badge bg-primary me-2">Master Product</span>
                                                <span className="fw-bold text-body fs-15">{selectedMasterProduct.name}</span>
                                                <span className="text-muted ms-2 small">SKU: {selectedMasterProduct.sku || 'N/A'}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-12">
                                                    <i className="ri-scales-3-line me-1"></i> Base Inventory Unit: <strong>{selectedMasterProduct.base_uom?.name} ({selectedMasterProduct.base_uom?.symbol})</strong>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 2: Initial Inward Stock & Unit Conversion */}
                                    <div className="row g-3 mb-4 bg-body-secondary p-3 border rounded">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold text-body mb-1">
                                                Initial Opening Stock *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className={`form-control ${assignForm.errors.stock ? 'is-invalid' : ''}`}
                                                placeholder="0.00"
                                                value={assignForm.data.stock}
                                                onChange={(e) => assignForm.setData('stock', e.target.value)}
                                                required
                                            />
                                            {assignForm.errors.stock && <div className="invalid-feedback">{assignForm.errors.stock}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold text-body mb-1">
                                                Stock Receiving Unit
                                            </label>
                                            <SearchableSelect
                                                options={stockReceivingUnitOptions}
                                                value={assignForm.data.stock_uom_id}
                                                onChange={(val) => assignForm.setData('stock_uom_id', val)}
                                                placeholder="-- Choose Stock Receiving Unit --"
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label small fw-semibold text-muted mb-1">
                                                Converted Base Stock (Ledger)
                                            </label>
                                            <div className="form-control bg-body fw-bold text-success border-success-subtle d-flex align-items-center justify-content-between">
                                                <span>{assignCalculatedBaseStock}</span>
                                                <span className="badge bg-success-subtle text-success">
                                                    {selectedMasterProduct?.base_uom?.symbol || 'Base Unit'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-2">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Opening Notes / Remark (e.g. Initial opening stock assigned by backoffice)"
                                                value={assignForm.data.notes}
                                                onChange={(e) => assignForm.setData('notes', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Section 3: Vendor Multi-UOM Pricing & Loose-Sale Rules (1st Screenshot Matrix) */}
                                    <div className="border rounded p-3 bg-body shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                            <div>
                                                <h6 className="fw-bold text-primary mb-1 d-flex align-items-center">
                                                    <i className="ri-equalizer-line me-2"></i>Vendor Selling Units, Packaging & Loose Sale Rules
                                                </h6>
                                                <p className="text-muted small mb-0">
                                                    Control prices for each selling unit and whether this vendor allows loose retail sale or full pack only.
                                                </p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => setAllAssignLoose(false)}
                                                    title="Disallow loose sale on all units (Full Package Only)"
                                                >
                                                    <i className="ri-archive-line me-1"></i> Full Pack Only (All)
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => setAllAssignLoose(true)}
                                                    title="Allow loose retail sale on all units"
                                                >
                                                    <i className="ri-scales-line me-1"></i> Allow Loose (All)
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={addAssignMatrixRow}
                                                >
                                                    <i className="ri-add-line me-1"></i> Add Selling Unit
                                                </button>
                                            </div>
                                        </div>

                                        {assignForm.data.pricing_matrix.length === 0 ? (
                                            <div className="alert alert-info py-3 text-center mb-0">
                                                Please select a Master Product above to configure selling units and loose sale rules.
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-sm align-middle text-nowrap mb-0">
                                                    <thead className="table-light text-body-secondary small text-uppercase">
                                                        <tr>
                                                            <th style={{ minWidth: '190px' }}>UOM (Selling Unit) *</th>
                                                            <th style={{ width: '120px' }}>Selling Price (₹) *</th>
                                                            <th style={{ width: '110px' }}>MRP (₹)</th>
                                                            <th style={{ width: '110px' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <span>Factor to Base</span>
                                                                    <InfoTooltip
                                                                        title="Factor to Base"
                                                                        content="Selling unit me kitne base unit hote hain. Example: 1 Cement Bag = 50 Kg to factor 50."
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th style={{ width: '160px' }} className="text-center">
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <span>Sell as Loose?</span>
                                                                    <InfoTooltip
                                                                        title="Sell as Loose vs Full Pack"
                                                                        content="Vendor control: Kya vendor is product ko khula (loose/retail per kg/piece) bechna chahta hai ya complete full pack me hi sell hoga?"
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th style={{ width: '90px' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <span>MOQ</span>
                                                                    <InfoTooltip
                                                                        title="Minimum Order Quantity"
                                                                        content="Customer is unit me minimum kitna order place kar sakta hai."
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th style={{ width: '100px' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <span>Step / Mult.</span>
                                                                    <InfoTooltip
                                                                        title="Step / Multiplier"
                                                                        content="Order quantity kis step multiple me badhegi (e.g. 1, 5, 10)."
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th style={{ width: '110px' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <span>Pack Contains</span>
                                                                    <InfoTooltip
                                                                        title="Pack Coverage / Weight"
                                                                        content="Ek pack ke andar kitna coverage area ya weight hota hai (e.g. 16 Sq. Ft, 50 Kg)."
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th style={{ width: '70px' }} className="text-center">Default</th>
                                                            <th style={{ width: '40px' }}></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assignForm.data.pricing_matrix.map((row, index) => (
                                                            <tr key={index} className={row.is_default_selling_unit ? 'table-primary-subtle' : ''}>
                                                                <td>
                                                                    <SearchableSelect
                                                                        options={formattedUoms}
                                                                        value={row.uom_id}
                                                                        onChange={(val) => updateAssignMatrixRow(index, 'uom_id', val)}
                                                                        placeholder="Search Unit..."
                                                                        nameKey="display_name"
                                                                        valueKey="id"
                                                                        size="sm"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="0.00"
                                                                        value={row.selling_price}
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'selling_price', e.target.value)}
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
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'mrp', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        step="0.0001"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="1.0"
                                                                        value={row.conversion_factor}
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'conversion_factor', e.target.value)}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <div className="form-check form-switch d-inline-block mb-0">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input cursor-pointer"
                                                                            id={`assign_loose_${index}`}
                                                                            checked={row.allow_loose_sale}
                                                                            onChange={(e) => updateAssignMatrixRow(index, 'allow_loose_sale', e.target.checked)}
                                                                        />
                                                                        <label className="form-check-label fs-12 ms-1 cursor-pointer" htmlFor={`assign_loose_${index}`}>
                                                                            {row.allow_loose_sale ? (
                                                                                <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                                                    Yes (Loose)
                                                                                </span>
                                                                            ) : (
                                                                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                                                                    No (Full Pack)
                                                                                </span>
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
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'min_order_qty', e.target.value)}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="form-control form-control-sm"
                                                                        value={row.step_qty}
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'step_qty', e.target.value)}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        className="form-control form-control-sm"
                                                                        placeholder="e.g. 50"
                                                                        value={row.pack_contain_qty}
                                                                        onChange={(e) => updateAssignMatrixRow(index, 'pack_contain_qty', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="radio"
                                                                        name="assign_default_selling_unit"
                                                                        className="form-check-input cursor-pointer"
                                                                        checked={row.is_default_selling_unit}
                                                                        onChange={() => updateAssignMatrixRow(index, 'is_default_selling_unit', true)}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-link text-danger p-0"
                                                                        onClick={() => removeAssignMatrixRow(index)}
                                                                        disabled={assignForm.data.pricing_matrix.length <= 1}
                                                                        title="Remove Unit"
                                                                    >
                                                                        <i className="ri-delete-bin-line fs-15"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer bg-body-tertiary flex-shrink-0 border-top">
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary btn-sm px-3" disabled={assignForm.processing}>
                                        {assignForm.processing ? 'Saving...' : 'Save & Assign Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: QUICK ADD STOCK */}
            {isAddStockModalOpen && selectedVP && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-dialog-centered my-3">
                        <div className="modal-content shadow">
                            <form onSubmit={handleAddStockSubmit}>
                                <div className="modal-header d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <h5 className="modal-title fw-bold mb-0">Add Inward Stock Arrival</h5>
                                        <FormTrainingButton
                                            onClick={() => setShowStockInwardTraining(true)}
                                            label="Stock Inward Guide"
                                        />
                                    </div>
                                    <button type="button" className="btn-close" onClick={() => setIsAddStockModalOpen(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="p-3 mb-3 bg-body-secondary rounded border">
                                        <div className="fw-semibold text-body fs-15">{selectedVP.product?.name}</div>
                                        <div className="text-muted small">Vendor: {selectedVP.vendor?.vendor_name}</div>
                                        <div className="text-primary fw-bold mt-1">
                                            Current Base Stock: {parseFloat(selectedVP.stock).toFixed(2)} {selectedVP.product?.base_uom?.symbol}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Quantity to Add (+) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="form-control"
                                            placeholder="Enter incoming arrival quantity"
                                            value={addStockForm.data.quantity_to_add}
                                            onChange={(e) => addStockForm.setData('quantity_to_add', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Invoice / Challan Reference</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. INV-2026-904"
                                            value={addStockForm.data.challan_or_invoice_no}
                                            onChange={(e) => addStockForm.setData('challan_or_invoice_no', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Notes / Remarks</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Shipment received from warehouse"
                                            value={addStockForm.data.notes}
                                            onChange={(e) => addStockForm.setData('notes', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddStockModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success btn-sm" disabled={addStockForm.processing}>
                                        {addStockForm.processing ? 'Adding...' : '+ Add Stock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: EDIT PRICE, PACKAGING & STOCK ADJUSTMENT */}
            {isEditModalOpen && selectedVP && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered my-3" style={{ maxHeight: '92vh' }}>
                        <div className="modal-content shadow-lg border-0 d-flex flex-column" style={{ maxHeight: '92vh', overflow: 'hidden' }}>
                            <form onSubmit={handleEditSubmit} className="d-flex flex-column flex-grow-1" style={{ minHeight: 0, maxHeight: '92vh' }}>
                                <div className="modal-header bg-primary text-white py-3 flex-shrink-0 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="modal-title fw-bold mb-0 text-white">
                                            <i className="ri-edit-line me-2"></i>Manage Vendor Product Stock & Packaging
                                        </h5>
                                        <small className="opacity-75">Adjust inventory and configure vendor-specific unit pricing and loose sale rules</small>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FormTrainingButton
                                            onClick={() => setShowAssignTraining(true)}
                                            label="Stock & Pricing Guide"
                                            className="btn btn-light btn-sm text-primary fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
                                        />
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditModalOpen(false)}></button>
                                    </div>
                                </div>
                                <div className="modal-body p-4 flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                                    <div className="p-3 mb-3 bg-body-secondary rounded border d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <div>
                                            <div className="fw-bold text-body fs-15">{selectedVP.product?.name}</div>
                                            <div className="text-muted small">Vendor: {selectedVP.vendor?.vendor_name} ({selectedVP.vendor?.owner_name})</div>
                                        </div>
                                        <div>
                                            <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 fs-12">
                                                Base Unit: {selectedVP.product?.base_uom?.name} ({selectedVP.product?.base_uom?.symbol})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Physical Stock Audit Adjustment */}
                                    <div className="row g-3 mb-4 bg-body-secondary p-3 border rounded">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-body">
                                                Target Base Stock ({selectedVP.product?.base_uom?.symbol})
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                value={editForm.data.stock}
                                                onChange={(e) => editForm.setData('stock', e.target.value)}
                                            />
                                            <small className="text-muted">Modifying this will generate an automatic audit adjustment ledger passbook entry.</small>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-semibold text-body">
                                                Reason for Stock Count Audit
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Physical inventory cycle count difference"
                                                value={editForm.data.reason}
                                                onChange={(e) => editForm.setData('reason', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Multi-UOM Pricing Matrix for Vendor */}
                                    <div className="border rounded p-3 bg-body shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                            <div>
                                                <h6 className="fw-bold text-primary mb-1 d-flex align-items-center">
                                                    <i className="ri-equalizer-line me-2"></i>Vendor Selling Units, Packaging & Loose Sale Rules
                                                </h6>
                                                <p className="text-muted small mb-0">Customize prices and toggle whether this vendor permits loose sale or full pack only.</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => setAllEditLoose(false)}
                                                    title="Disallow loose sale on all units"
                                                >
                                                    <i className="ri-archive-line me-1"></i> Full Pack Only (All)
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => setAllEditLoose(true)}
                                                    title="Allow loose sale on all units"
                                                >
                                                    <i className="ri-scales-line me-1"></i> Allow Loose (All)
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={addEditMatrixRow}
                                                >
                                                    <i className="ri-add-line me-1"></i> Add Unit
                                                </button>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="table table-bordered table-sm align-middle text-nowrap mb-0">
                                                <thead className="table-light text-body-secondary small text-uppercase">
                                                    <tr>
                                                        <th style={{ minWidth: '190px' }}>UOM (Selling Unit) *</th>
                                                        <th style={{ width: '120px' }}>Selling Price (₹) *</th>
                                                        <th style={{ width: '110px' }}>MRP (₹)</th>
                                                        <th style={{ width: '110px' }}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <span>Factor to Base</span>
                                                                <InfoTooltip
                                                                    title="Conversion Factor"
                                                                    content="1 selling unit me kitne base unit hote hain."
                                                                />
                                                            </div>
                                                        </th>
                                                        <th style={{ width: '160px' }} className="text-center">
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <span>Sell as Loose?</span>
                                                                <InfoTooltip
                                                                    title="Sell as Loose vs Full Pack"
                                                                    content="Kya vendor loose sale allow karta hai ya full pack lena hoga."
                                                                />
                                                            </div>
                                                        </th>
                                                        <th style={{ width: '90px' }}>MOQ</th>
                                                        <th style={{ width: '100px' }}>Step / Mult.</th>
                                                        <th style={{ width: '110px' }}>Pack Contains</th>
                                                        <th style={{ width: '70px' }} className="text-center">Default</th>
                                                        <th style={{ width: '40px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {editForm.data.pricing_matrix.map((row, index) => (
                                                        <tr key={index} className={row.is_default_selling_unit ? 'table-primary-subtle' : ''}>
                                                            <td>
                                                                <SearchableSelect
                                                                    options={formattedUoms}
                                                                    value={row.uom_id}
                                                                    onChange={(val) => updateEditMatrixRow(index, 'uom_id', val)}
                                                                    placeholder="Search Unit..."
                                                                    nameKey="display_name"
                                                                    valueKey="id"
                                                                    size="sm"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control form-control-sm"
                                                                    value={row.selling_price}
                                                                    onChange={(e) => updateEditMatrixRow(index, 'selling_price', e.target.value)}
                                                                    required
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control form-control-sm"
                                                                    value={row.mrp}
                                                                    onChange={(e) => updateEditMatrixRow(index, 'mrp', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.0001"
                                                                    className="form-control form-control-sm"
                                                                    value={row.conversion_factor}
                                                                    onChange={(e) => updateEditMatrixRow(index, 'conversion_factor', e.target.value)}
                                                                    required
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="form-check form-switch d-inline-block mb-0">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input cursor-pointer"
                                                                        id={`edit_loose_${index}`}
                                                                        checked={row.allow_loose_sale}
                                                                        onChange={(e) => updateEditMatrixRow(index, 'allow_loose_sale', e.target.checked)}
                                                                    />
                                                                    <label className="form-check-label fs-12 ms-1 cursor-pointer" htmlFor={`edit_loose_${index}`}>
                                                                        {row.allow_loose_sale ? (
                                                                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                                                Yes (Loose)
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                                                                No (Full Pack)
                                                                            </span>
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
                                                                    onChange={(e) => updateEditMatrixRow(index, 'min_order_qty', e.target.value)}
                                                                    required
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control form-control-sm"
                                                                    value={row.step_qty}
                                                                    onChange={(e) => updateEditMatrixRow(index, 'step_qty', e.target.value)}
                                                                    required
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control form-control-sm"
                                                                    placeholder="e.g. 50"
                                                                    value={row.pack_contain_qty}
                                                                    onChange={(e) => updateEditMatrixRow(index, 'pack_contain_qty', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <input
                                                                    type="radio"
                                                                    name="edit_default_selling_unit"
                                                                    className="form-check-input cursor-pointer"
                                                                    checked={row.is_default_selling_unit}
                                                                    onChange={() => updateEditMatrixRow(index, 'is_default_selling_unit', true)}
                                                                />
                                                            </td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-link text-danger p-0"
                                                                    onClick={() => removeEditMatrixRow(index)}
                                                                    disabled={editForm.data.pricing_matrix.length <= 1}
                                                                    title="Remove Unit"
                                                                >
                                                                    <i className="ri-delete-bin-line fs-15"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-body-tertiary flex-shrink-0 border-top">
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary btn-sm px-3" disabled={editForm.processing}>
                                        {editForm.processing ? 'Updating...' : 'Update Vendor Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Training Guide Modals */}
            <FormTrainingModal
                isOpen={showAssignTraining}
                onClose={() => setShowAssignTraining(false)}
                formKey="assignVendorProduct"
            />

            <FormTrainingModal
                isOpen={showStockInwardTraining}
                onClose={() => setShowStockInwardTraining(false)}
                formKey="stockInward"
            />
        </AdminLayout>
    );
}
