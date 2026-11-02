import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function UomIndex({ uoms = { data: [] } }) {
    const [editingUom, setEditingUom] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        symbol: '',
        unit_category: 'mass',
        is_discrete: false,
    });

    const openCreateModal = () => {
        setEditingUom(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (uom) => {
        setEditingUom(uom);
        setData({
            name: uom.name,
            code: uom.code,
            symbol: uom.symbol,
            unit_category: uom.unit_category,
            is_discrete: !!uom.is_discrete,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUom) {
            post(route('admin.catalog.uoms.update', editingUom.id), {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingUom(null);
                    reset();
                },
            });
        } else {
            post(route('admin.catalog.uoms.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'mass': return 'bg-primary-subtle text-primary border-primary-subtle';
            case 'volume': return 'bg-info-subtle text-info border-info-subtle';
            case 'area': return 'bg-warning-subtle text-warning border-warning-subtle';
            case 'length': return 'bg-purple-subtle text-purple border-purple-subtle';
            case 'discrete_pack': return 'bg-danger-subtle text-danger border-danger-subtle';
            default: return 'bg-secondary-subtle text-secondary border-secondary-subtle';
        }
    };

    return (
        <AdminLayout
            title="Units of Measure (UOM) Master"
            breadcrumbs={['Admin', 'Product Master', 'UOM Master']}
        >
            <Head title="Units of Measure - BuilDeck Admin" />

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                    <div>
                        <h5 className="card-title mb-0 fw-semibold">
                            <i className="ri-ruler-line me-2 text-primary"></i>
                            Units of Measure
                        </h5>
                        <small className="text-muted">Master table for all physical and packaging units</small>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                        <i className="ri-add-line me-1"></i> Add Unit
                    </button>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Unit Name</th>
                                    <th>Code</th>
                                    <th>Symbol</th>
                                    <th>Category</th>
                                    <th>Packaging Type</th>
                                    <th>Usage Count</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!uoms.data || uoms.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            No UOMs registered. Click "Add Unit" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    uoms.data.map((uom) => (
                                        <tr key={uom.id}>
                                            <td className="fw-semibold text-dark">{uom.name}</td>
                                            <td><code className="text-dark bg-light px-2 py-1 rounded">{uom.code}</code></td>
                                            <td className="fw-bold">{uom.symbol}</td>
                                            <td>
                                                <span className={`badge border text-capitalize ${getCategoryBadge(uom.unit_category)}`}>
                                                    {uom.unit_category.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${uom.is_discrete ? 'bg-dark text-white' : 'bg-light text-muted border'}`}>
                                                    {uom.is_discrete ? 'Packaged / Discrete' : 'Continuous / Bulk'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge rounded-pill bg-light text-dark border">
                                                    {uom.product_prices_count || 0} pricing rows
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => openEditModal(uom)}
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
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingUom ? 'Edit UOM' : 'Add Unit of Measure'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Unit Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Kilogram, Metric Tonne, Brass, Box"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g. KG, TONNE, BRASS, BOX"
                                            disabled={!!editingUom}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Symbol</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={data.symbol}
                                            onChange={(e) => setData('symbol', e.target.value)}
                                            placeholder="e.g. kg, MT, brass, box"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Unit Category</label>
                                        <select
                                            className="form-select"
                                            value={data.unit_category}
                                            onChange={(e) => setData('unit_category', e.target.value)}
                                            required
                                        >
                                            <option value="mass">Mass / Weight (Kg, Tonne, Quintal)</option>
                                            <option value="volume">Volume (Cft, Brass, Litre)</option>
                                            <option value="area">Area (Sq. Ft., Sq. Meter)</option>
                                            <option value="length">Length (Meter, Foot)</option>
                                            <option value="discrete_pack">Discrete Packaging (Bag, Box, Coil, Bundle, Bucket)</option>
                                            <option value="count">Count (Piece, Pair)</option>
                                        </select>
                                    </div>
                                    <div className="form-check form-switch mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="isDiscreteSwitch"
                                            checked={data.is_discrete}
                                            onChange={(e) => setData('is_discrete', e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="isDiscreteSwitch">
                                            Is Discrete / Packaged Unit
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>Save Unit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

