import AdminLayout from "@/Layouts/AdminLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import axios from "axios";
import { useState, useEffect } from "react";

export default function Index({ states = [], vendors = { data: [] } }) {
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form'
    const [editingVendor, setEditingVendor] = useState(null);

    // Dynamic cities
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    // Credentials Modal State
    const [selectedVendorForCredentials, setSelectedVendorForCredentials] = useState(null);
    const [customPassword, setCustomPassword] = useState('');
    const [submittingCredentials, setSubmittingCredentials] = useState(false);

    // Form setup for Onboard / Edit
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        vendor_name: '',
        email: '',
        mobile: '',
        owner_name: '',
        address: '',
        gst: '',
        aadhaar: '',
        pan: '',
        bussiness_certificate: '',
        supply_radius: '',
        lat: '',
        long: '',
        state_id: '',
        city_id: '',
        pincode: '',
        aadaar_doc: null,
        pan_doc: null,
        bussiness_certificate_doc: null,
    });

    // Helper: load cities for a state
    const fetchCities = (stateId, callback) => {
        if (!stateId) {
            setCities([]);
            return;
        }
        setLoadingCities(true);
        axios
            .get(route('admin.cities.by-state', stateId))
            .then((res) => {
                setCities(res.data || []);
                if (callback) callback();
            })
            .catch((err) => {
                console.error("Cities loading failed:", err);
                setCities([]);
            })
            .finally(() => {
                setLoadingCities(false);
            });
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setData((prev) => ({
            ...prev,
            state_id: stateId,
            city_id: '',
        }));
        fetchCities(stateId);
    };

    // Switch to edit mode
    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        clearErrors();
        fetchCities(vendor.state_id, () => {
            setData({
                vendor_name: vendor.vendor_name || '',
                email: vendor.email || '',
                mobile: vendor.mobile || '',
                owner_name: vendor.owner_name || '',
                address: vendor.address || '',
                gst: vendor.gst || '',
                aadhaar: vendor.aadhaar || '',
                pan: vendor.pan || '',
                bussiness_certificate: vendor.bussiness_certificate || '',
                supply_radius: vendor.supply_radius || '',
                lat: vendor.lat || '',
                long: vendor.long || '',
                state_id: vendor.state_id || '',
                city_id: vendor.city_id || '',
                pincode: vendor.pincode || '',
                aadaar_doc: null,
                pan_doc: null,
                bussiness_certificate_doc: null,
            });
            setActiveTab('form');
        });
    };

    const handleCancelEdit = () => {
        setEditingVendor(null);
        reset();
        setCities([]);
        setActiveTab('list');
    };

    // Submit handler (Create or Update)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingVendor) {
            post(route('admin.vendor.update', editingVendor.id), {
                forceFormData: true,
                onSuccess: () => {
                    setEditingVendor(null);
                    reset();
                    setActiveTab('list');
                },
            });
        } else {
            post(route('admin.vendor.store'), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setActiveTab('list');
                },
            });
        }
    };

    // Toggle vendor status (Approve / Deactivate)
    const handleStatusChange = (vendor, newStatus) => {
        if (!confirm(`Are you sure you want to mark this vendor as ${newStatus.toUpperCase()}?`)) {
            return;
        }

        router.patch(route('admin.vendor.status', vendor.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    // Generate credentials submit
    const handleGenerateCredentialsSubmit = (e) => {
        e.preventDefault();
        if (!selectedVendorForCredentials) return;

        setSubmittingCredentials(true);
        router.post(
            route('admin.vendor.credentials', selectedVendorForCredentials.id),
            { password: customPassword },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedVendorForCredentials(null);
                    setCustomPassword('');
                },
                onFinish: () => {
                    setSubmittingCredentials(false);
                },
            }
        );
    };

    return (
        <AdminLayout>
            <Head title="Vendor Management & Onboarding" />

            {/* Page Header */}
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                        <h4 className="page-title mb-0">Vendors Management</h4>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                <li className="breadcrumb-item"><a href="#!">Admin</a></li>
                                <li className="breadcrumb-item"><a href="#!">Vendors</a></li>
                                <li className="breadcrumb-item active">Onboard</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="ri-check-double-line me-2 fs-16"></i>
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="ri-error-warning-line me-2 fs-16"></i>
                    {flash.error}
                </div>
            )}

            {/* Newly Generated Credentials Banner */}
            {flash?.generated_credentials && (
                <div className="alert alert-info border-info shadow-sm">
                    <div className="d-flex align-items-start justify-content-between">
                        <div>
                            <h5 className="alert-heading text-info fw-bold mb-2">
                                <i className="ri-key-2-line me-1"></i> Vendor Login Credentials Created!
                            </h5>
                            <p className="mb-2 fs-13">
                                Share these details with <strong>{flash.generated_credentials.vendor_name}</strong> ({flash.generated_credentials.owner_name}):
                            </p>
                            <div className="bg-light p-3 rounded border text-dark font-monospace fs-14">
                                <div><strong>Login ID (Mobile):</strong> {flash.generated_credentials.login_id}</div>
                                <div><strong>Email:</strong> {flash.generated_credentials.email}</div>
                                <div><strong>Password:</strong> <span className="badge bg-dark fs-14 text-warning">{flash.generated_credentials.password}</span></div>
                                <div className="mt-1 text-muted fs-12">Role: Vendor | Status: Approved</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() => {
                                const text = `Vendor: ${flash.generated_credentials.vendor_name}\nLogin ID: ${flash.generated_credentials.login_id}\nPassword: ${flash.generated_credentials.password}`;
                                navigator.clipboard.writeText(text);
                                alert("Credentials copied to clipboard!");
                            }}
                        >
                            <i className="ri-file-copy-line me-1"></i> Copy
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="row mb-3">
                <div className="col-12">
                    <ul className="nav nav-pills bg-light p-1 rounded d-inline-flex">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                                onClick={() => setActiveTab('list')}
                            >
                                <i className="ri-list-check-2 me-1"></i>
                                Vendors List ({vendors?.total || vendors?.data?.length || 0})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'form' ? 'active' : ''}`}
                                onClick={() => {
                                    if (!editingVendor) reset();
                                    setActiveTab('form');
                                }}
                            >
                                <i className={editingVendor ? "ri-edit-line me-1" : "ri-user-add-line me-1"}></i>
                                {editingVendor ? `Edit: ${editingVendor.vendor_name}` : "Onboard New Vendor"}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* TAB 1: VENDORS LIST */}
            {activeTab === 'list' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="header-title mb-0">Registered Vendors</h4>
                                    <p className="text-muted fs-13 mb-0">Approve vendors, generate login credentials, or edit details.</p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setEditingVendor(null);
                                        reset();
                                        setActiveTab('form');
                                    }}
                                >
                                    <i className="ri-add-line me-1"></i> Onboard New
                                </button>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover table-centered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Vendor & Owner</th>
                                                <th>Contact</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Login Account</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendors?.data?.length > 0 ? (
                                                vendors.data.map((v, idx) => (
                                                    <tr key={v.id}>
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            <div className="fw-bold fs-14 text-dark">{v.vendor_name}</div>
                                                            <div className="text-muted fs-12">{v.owner_name}</div>
                                                        </td>
                                                        <td>
                                                            <div><i className="ri-phone-line me-1 text-primary"></i>{v.mobile}</div>
                                                            <div className="text-muted fs-12">{v.email}</div>
                                                        </td>
                                                        <td>
                                                            <div>{v.city?.name || '—'}</div>
                                                            <div className="text-muted fs-12">{v.state?.name || '—'}</div>
                                                        </td>
                                                        <td>
                                                            {v.status === 'approved' && (
                                                                <span className="badge bg-success-subtle text-success fs-12">
                                                                    <i className="ri-check-line me-1"></i> Approved
                                                                </span>
                                                            )}
                                                            {v.status === 'pending' && (
                                                                <span className="badge bg-warning-subtle text-warning fs-12">
                                                                    <i className="ri-time-line me-1"></i> Pending
                                                                </span>
                                                            )}
                                                            {v.status === 'deactivated' && (
                                                                <span className="badge bg-danger-subtle text-danger fs-12">
                                                                    <i className="ri-close-circle-line me-1"></i> Deactivated
                                                                </span>
                                                            )}
                                                            {v.status === 'rejected' && (
                                                                <span className="badge bg-secondary-subtle text-secondary fs-12">
                                                                    Rejected
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {v.user_id ? (
                                                                <span className="badge bg-info-subtle text-info fs-12">
                                                                    <i className="ri-user-follow-line me-1"></i> Credentials Created
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-light text-muted fs-12">
                                                                    Not Generated
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="d-flex align-items-center justify-content-end gap-1">
                                                                {/* Edit */}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    title="Edit Vendor"
                                                                    onClick={() => handleEdit(v)}
                                                                >
                                                                    <i className="ri-edit-line"></i>
                                                                </button>

                                                                {/* Status Toggle: Approve */}
                                                                {v.status !== 'approved' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-success"
                                                                        title="Approve Vendor"
                                                                        onClick={() => handleStatusChange(v, 'approved')}
                                                                    >
                                                                        <i className="ri-check-line me-1"></i> Approve
                                                                    </button>
                                                                )}

                                                                {/* Status Toggle: Deactivate */}
                                                                {v.status === 'approved' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        title="Deactivate Vendor"
                                                                        onClick={() => handleStatusChange(v, 'deactivated')}
                                                                    >
                                                                        <i className="ri-forbid-line me-1"></i> Deactivate
                                                                    </button>
                                                                )}

                                                                {/* Generate Login Credentials - Allowed ONLY when status is approved */}
                                                                {v.status === 'approved' ? (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
                                                                        title="Generate or Reset Login Credentials"
                                                                        onClick={() => setSelectedVendorForCredentials(v)}
                                                                    >
                                                                        <i className="ri-key-2-line me-1"></i>
                                                                        {v.user_id ? 'Reset Login' : 'Generate Login'}
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-secondary disabled opacity-50"
                                                                        title="Approve vendor first to enable login generation"
                                                                        disabled
                                                                    >
                                                                        <i className="ri-lock-line me-1"></i> Generate Login
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-muted">
                                                        <i className="ri-store-2-line fs-32 d-block mb-1 text-secondary"></i>
                                                        No vendors found. Click "Onboard New Vendor" to add one.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ONBOARD / EDIT FORM */}
            {activeTab === 'form' && (
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="row">
                        {editingVendor && (
                            <div className="col-12 mb-3">
                                <div className="alert alert-warning d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="ri-edit-line me-2"></i>
                                        Editing Vendor: <strong>{editingVendor.vendor_name}</strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-dark"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel Edit
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Section 1: Basic Information */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-store-2-line me-2 text-primary"></i>
                                        Basic & Business Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="vendor_name" className="form-label">
                                                Vendor / Business Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="vendor_name"
                                                className={`form-control ${errors.vendor_name ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Ramesh Hardware & Supplies"
                                                value={data.vendor_name}
                                                onChange={(e) => setData('vendor_name', e.target.value)}
                                            />
                                            {errors.vendor_name && <div className="invalid-feedback">{errors.vendor_name}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="owner_name" className="form-label">
                                                Owner Full Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="owner_name"
                                                className={`form-control ${errors.owner_name ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Ramesh Sharma"
                                                value={data.owner_name}
                                                onChange={(e) => setData('owner_name', e.target.value)}
                                            />
                                            {errors.owner_name && <div className="invalid-feedback">{errors.owner_name}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="email" className="form-label">
                                                Email Address <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="vendor@example.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="mobile" className="form-label">
                                                Mobile Number <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="mobile"
                                                className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                                                placeholder="+91 9876543210"
                                                value={data.mobile}
                                                onChange={(e) => setData('mobile', e.target.value)}
                                            />
                                            {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="supply_radius" className="form-label">
                                                Supply Radius (KM)
                                            </label>
                                            <input
                                                type="number"
                                                id="supply_radius"
                                                step="0.1"
                                                className={`form-control ${errors.supply_radius ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 25"
                                                value={data.supply_radius}
                                                onChange={(e) => setData('supply_radius', e.target.value)}
                                            />
                                            {errors.supply_radius && <div className="invalid-feedback">{errors.supply_radius}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address & Geolocation */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-map-pin-line me-2 text-primary"></i>
                                        Address & Geolocation
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label htmlFor="address" className="form-label">Street / Full Address</label>
                                            <textarea
                                                id="address"
                                                rows="2"
                                                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                                placeholder="Shop no., Street, Landmark, Area"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                            ></textarea>
                                            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="state_id" className="form-label">
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <SearchableSelect
                                                id="state_id"
                                                placeholder="-- Select State --"
                                                options={states}
                                                value={data.state_id}
                                                onChange={(selectedStateId) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        state_id: selectedStateId,
                                                        city_id: '',
                                                    }));
                                                    fetchCities(selectedStateId);
                                                }}
                                                error={errors.state_id}
                                            />
                                            {errors.state_id && <div className="text-danger fs-12 mt-1">{errors.state_id}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="city_id" className="form-label">
                                                City <span className="text-danger">*</span>
                                            </label>
                                            <SearchableSelect
                                                id="city_id"
                                                placeholder={
                                                    loadingCities
                                                        ? 'Loading cities...'
                                                        : !data.state_id
                                                        ? '-- Select State First --'
                                                        : '-- Select City --'
                                                }
                                                options={cities}
                                                value={data.city_id}
                                                onChange={(selectedCityId) => setData('city_id', selectedCityId)}
                                                disabled={!data.state_id || loadingCities}
                                                error={errors.city_id}
                                            />
                                            {errors.city_id && <div className="text-danger fs-12 mt-1">{errors.city_id}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="pincode" className="form-label">Pincode</label>
                                            <input
                                                type="text"
                                                id="pincode"
                                                className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 400001"
                                                value={data.pincode}
                                                onChange={(e) => setData('pincode', e.target.value)}
                                            />
                                            {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="lat" className="form-label">Latitude</label>
                                            <input
                                                type="text"
                                                id="lat"
                                                className={`form-control ${errors.lat ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 19.0760"
                                                value={data.lat}
                                                onChange={(e) => setData('lat', e.target.value)}
                                            />
                                            {errors.lat && <div className="invalid-feedback">{errors.lat}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="long" className="form-label">Longitude</label>
                                            <input
                                                type="text"
                                                id="long"
                                                className={`form-control ${errors.long ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 72.8777"
                                                value={data.long}
                                                onChange={(e) => setData('long', e.target.value)}
                                            />
                                            {errors.long && <div className="invalid-feedback">{errors.long}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Identity & Numbers */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-shield-check-line me-2 text-primary"></i>
                                        Registration & Tax Numbers
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="gst" className="form-label">GST Number</label>
                                            <input
                                                type="text"
                                                id="gst"
                                                className={`form-control text-uppercase ${errors.gst ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 22AAAAA0000A1Z5"
                                                value={data.gst}
                                                onChange={(e) => setData('gst', e.target.value)}
                                            />
                                            {errors.gst && <div className="invalid-feedback">{errors.gst}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="pan" className="form-label">PAN Number</label>
                                            <input
                                                type="text"
                                                id="pan"
                                                className={`form-control text-uppercase ${errors.pan ? 'is-invalid' : ''}`}
                                                placeholder="e.g. ABCDE1234F"
                                                value={data.pan}
                                                onChange={(e) => setData('pan', e.target.value)}
                                            />
                                            {errors.pan && <div className="invalid-feedback">{errors.pan}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="aadhaar" className="form-label">Aadhaar Number</label>
                                            <input
                                                type="text"
                                                id="aadhaar"
                                                className={`form-control ${errors.aadhaar ? 'is-invalid' : ''}`}
                                                placeholder="12 digit Aadhaar number"
                                                value={data.aadhaar}
                                                onChange={(e) => setData('aadhaar', e.target.value)}
                                            />
                                            {errors.aadhaar && <div className="invalid-feedback">{errors.aadhaar}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="bussiness_certificate" className="form-label">
                                                Business Certificate No.
                                            </label>
                                            <input
                                                type="text"
                                                id="bussiness_certificate"
                                                className={`form-control ${errors.bussiness_certificate ? 'is-invalid' : ''}`}
                                                placeholder="e.g. MSME / Udyam No."
                                                value={data.bussiness_certificate}
                                                onChange={(e) => setData('bussiness_certificate', e.target.value)}
                                            />
                                            {errors.bussiness_certificate && <div className="invalid-feedback">{errors.bussiness_certificate}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Document Uploads */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-file-upload-line me-2 text-primary"></i>
                                        KYC Documents Upload
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label htmlFor="aadaar_doc" className="form-label">Aadhaar Document</label>
                                            <input
                                                type="file"
                                                id="aadaar_doc"
                                                className={`form-control ${errors.aadaar_doc ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('aadaar_doc', e.target.files[0])}
                                            />
                                            {errors.aadaar_doc && <div className="invalid-feedback">{errors.aadaar_doc}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="pan_doc" className="form-label">PAN Card Document</label>
                                            <input
                                                type="file"
                                                id="pan_doc"
                                                className={`form-control ${errors.pan_doc ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('pan_doc', e.target.files[0])}
                                            />
                                            {errors.pan_doc && <div className="invalid-feedback">{errors.pan_doc}</div>}
                                        </div>

                                        <div className="col-md-4">
                                            <label htmlFor="bussiness_certificate_doc" className="form-label">
                                                Business Certificate Document
                                            </label>
                                            <input
                                                type="file"
                                                id="bussiness_certificate_doc"
                                                className={`form-control ${errors.bussiness_certificate_doc ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('bussiness_certificate_doc', e.target.files[0])}
                                            />
                                            {errors.bussiness_certificate_doc && <div className="invalid-feedback">{errors.bussiness_certificate_doc}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="col-12 mb-4">
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-2"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Submit & Onboard'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light px-4 py-2"
                                    onClick={() => {
                                        if (editingVendor) {
                                            handleCancelEdit();
                                        } else {
                                            reset();
                                        }
                                    }}
                                >
                                    {editingVendor ? 'Cancel' : 'Reset'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* MODAL: GENERATE LOGIN CREDENTIALS */}
            {selectedVendorForCredentials && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleGenerateCredentialsSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ri-key-2-line me-1 text-primary"></i>
                                        Generate Login ID & Password
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedVendorForCredentials(null)}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <div className="alert alert-light border">
                                        <div><strong>Vendor:</strong> {selectedVendorForCredentials.vendor_name}</div>
                                        <div><strong>Owner:</strong> {selectedVendorForCredentials.owner_name}</div>
                                        <div><strong>Login ID (Mobile):</strong> {selectedVendorForCredentials.mobile}</div>
                                        <div><strong>Email:</strong> {selectedVendorForCredentials.email}</div>
                                        <div className="mt-1">
                                            <strong>Status:</strong>{' '}
                                            <span className="badge bg-success-subtle text-success">Approved</span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="custom_password">
                                            Password (leave blank to auto-generate a secure password):
                                        </label>
                                        <input
                                            type="text"
                                            id="custom_password"
                                            className="form-control"
                                            placeholder="Enter password or leave blank for auto"
                                            value={customPassword}
                                            onChange={(e) => setCustomPassword(e.target.value)}
                                        />
                                        <small className="text-muted">
                                            The vendor will use their <strong>Mobile Number ({selectedVendorForCredentials.mobile})</strong> or <strong>Email</strong> to login.
                                        </small>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedVendorForCredentials(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submittingCredentials}
                                    >
                                        {submittingCredentials ? 'Generating...' : 'Confirm & Generate'}
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
