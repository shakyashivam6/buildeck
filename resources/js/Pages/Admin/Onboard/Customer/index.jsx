import AdminLayout from "@/Layouts/AdminLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";

export default function Index({ states = [], customers = { data: [] } }) {
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'form'
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Dynamic cities
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    // Credentials Modal State
    const [selectedCustomerForCredentials, setSelectedCustomerForCredentials] = useState(null);
    const [customPassword, setCustomPassword] = useState('');
    const [submittingCredentials, setSubmittingCredentials] = useState(false);

    // Form setup for Customer Onboard / Edit
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        mobile: '',
        address: '',
        state_id: '',
        city_id: '',
        zip: '',
        lat: '',
        long: '',
        aadhaar: '',
        pan: '',
        profile_pic: null,
        aadhaar_doc: null,
        pan_doc: null,
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

    // Switch to edit mode
    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        clearErrors();

        const stateId = customer.state_id || customer.user?.state_id || '';
        fetchCities(stateId, () => {
            setData({
                name: customer.name || customer.user?.name || customer.vendor_name || customer.owner_name || '',
                email: customer.email || customer.user?.email || '',
                mobile: customer.mobile || customer.user?.mobile || '',
                address: customer.address || customer.user?.address || '',
                state_id: stateId,
                city_id: customer.city_id || customer.user?.city_id || '',
                zip: customer.zip || customer.pincode || customer.user?.zip || '',
                lat: customer.lat || customer.user?.lat || '',
                long: customer.long || customer.user?.long || '',
                aadhaar: customer.aadhaar || customer.user?.aadhaar || '',
                pan: customer.pan || customer.user?.pan || '',
                profile_pic: null,
                aadhaar_doc: null,
                pan_doc: null,
            });
            setActiveTab('form');
        });
    };

    const handleCancelEdit = () => {
        setEditingCustomer(null);
        reset();
        setCities([]);
        setActiveTab('list');
    };

    // Submit handler (Create or Update)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCustomer) {
            post(route('admin.customer.update', editingCustomer.id), {
                forceFormData: true,
                onSuccess: () => {
                    setEditingCustomer(null);
                    reset();
                    setActiveTab('list');
                },
            });
        } else {
            post(route('admin.customer.store'), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setActiveTab('list');
                },
            });
        }
    };

    const handleStatusChange = (customer, newStatus) => {
        const customerName = customer.name || customer.user?.name || 'this customer';
        if (!confirm(`Are you sure you want to mark ${customerName} as ${newStatus.toUpperCase()}?`)) {
            return;
        }

        router.post(route('admin.customer.status', customer.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    // Generate credentials submit
    const handleGenerateCredentialsSubmit = (e) => {
        e.preventDefault();
        if (!selectedCustomerForCredentials) return;

        setSubmittingCredentials(true);
        router.post(
            route('admin.customer.credentials', selectedCustomerForCredentials.id),
            { password: customPassword },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedCustomerForCredentials(null);
                    setCustomPassword('');
                },
                onFinish: () => {
                    setSubmittingCredentials(false);
                },
            }
        );
    };

    return (
        <AdminLayout
            title="Customers Management"
            breadcrumbs={['Admin', 'Customers', 'Onboard']}
        >
            <Head title="Customer Management & Onboarding" />

            <div className="pt-3">
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
                                <i className="ri-key-2-line me-1"></i> Customer Login Credentials Created!
                            </h5>
                            <p className="mb-2 fs-13">
                                Share these details with <strong>{flash.generated_credentials.name || flash.generated_credentials.vendor_name}</strong>:
                            </p>
                            <div className="bg-light p-3 rounded border text-dark font-monospace fs-14">
                                <div><strong>Login ID (Mobile):</strong> {flash.generated_credentials.login_id || flash.generated_credentials.mobile}</div>
                                <div><strong>Email:</strong> {flash.generated_credentials.email}</div>
                                <div><strong>Password:</strong> <span className="badge bg-dark fs-14 text-warning">{flash.generated_credentials.password}</span></div>
                                <div className="mt-1 text-muted fs-12">Role: Customer | Status: Approved</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() => {
                                const credName = flash.generated_credentials.name || flash.generated_credentials.vendor_name;
                                const loginId = flash.generated_credentials.login_id || flash.generated_credentials.mobile;
                                const text = `Customer: ${credName}\nLogin ID: ${loginId}\nPassword: ${flash.generated_credentials.password}`;
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
                                Customers List ({customers?.total || customers?.data?.length || 0})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'form' ? 'active' : ''}`}
                                onClick={() => {
                                    if (!editingCustomer) reset();
                                    setActiveTab('form');
                                }}
                            >
                                <i className={editingCustomer ? "ri-edit-line me-1" : "ri-user-add-line me-1"}></i>
                                {editingCustomer ? `Edit: ${editingCustomer.name || editingCustomer.user?.name || 'Customer'}` : "Onboard New Customer"}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* TAB 1: CUSTOMERS LIST */}
            {activeTab === 'list' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="header-title mb-0">Registered Customers</h4>
                                    <p className="text-muted fs-13 mb-0">Approve customers, generate login credentials, or update their details.</p>
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setEditingCustomer(null);
                                        reset();
                                        setActiveTab('form');
                                    }}
                                >
                                    <i className="ri-user-add-line me-1"></i> Onboard New Customer
                                </button>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover table-centered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Customer</th>
                                                <th>Contact</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Login Account</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers?.data?.length > 0 ? (
                                                customers.data.map((c, idx) => {
                                                    const customerName = c.name || c.user?.name || 'Unnamed';
                                                    const customerMobile = c.mobile || c.user?.mobile || '—';
                                                    const customerEmail = c.email || c.user?.email || '—';
                                                    const stateName = c.state?.name || c.user?.state?.name || '—';
                                                    const cityName = c.city?.name || c.user?.city?.name || '—';
                                                    const status = c.status || c.user?.status || 'pending';
                                                    const hasLogin = c.user_id || (c.password ? true : false);

                                                    return (
                                                        <tr key={c.id}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <div
                                                                        className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                                                        style={{ width: 36, height: 36, fontSize: 14 }}
                                                                    >
                                                                        {customerName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold fs-14 text-dark">{customerName}</div>
                                                                        <div className="text-muted fs-12">Customer ID: #{c.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div><i className="ri-phone-line me-1 text-primary"></i>{customerMobile}</div>
                                                                <div className="text-muted fs-12">{customerEmail}</div>
                                                            </td>
                                                            <td>
                                                                <div>{cityName}</div>
                                                                <div className="text-muted fs-12">{stateName}</div>
                                                            </td>
                                                            <td>
                                                                {status === 'approved' && (
                                                                    <span className="badge bg-success-subtle text-success fs-12">
                                                                        <i className="ri-check-line me-1"></i> Approved
                                                                    </span>
                                                                )}
                                                                {status === 'pending' && (
                                                                    <span className="badge bg-warning-subtle text-warning fs-12">
                                                                        <i className="ri-time-line me-1"></i> Pending
                                                                    </span>
                                                                )}
                                                                {status === 'deactivated' && (
                                                                    <span className="badge bg-danger-subtle text-danger fs-12">
                                                                        <i className="ri-close-circle-line me-1"></i> Deactivated
                                                                    </span>
                                                                )}
                                                                {status === 'rejected' && (
                                                                    <span className="badge bg-secondary-subtle text-secondary fs-12">
                                                                        Rejected
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {hasLogin ? (
                                                                    <span className="badge bg-info-subtle text-info fs-12">
                                                                        <i className="ri-user-follow-line me-1"></i> Credentials Active
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
                                                                        title="Edit Customer"
                                                                        onClick={() => handleEdit(c)}
                                                                    >
                                                                        <i className="ri-edit-line"></i>
                                                                    </button>

                                                                    {/* Status Toggle: Approve */}
                                                                    {status !== 'approved' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-success"
                                                                            title="Approve Customer"
                                                                            onClick={() => handleStatusChange(c, 'approved')}
                                                                        >
                                                                            <i className="ri-check-line me-1"></i> Approve
                                                                        </button>
                                                                    )}

                                                                    {/* Status Toggle: Deactivate */}
                                                                    {status === 'approved' && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            title="Deactivate Customer"
                                                                            onClick={() => handleStatusChange(c, 'deactivated')}
                                                                        >
                                                                            <i className="ri-forbid-line me-1"></i> Deactivate
                                                                        </button>
                                                                    )}

                                                                    {/* Generate Login Credentials */}
                                                                    {status === 'approved' ? (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-primary"
                                                                            title="Generate or Reset Login Credentials"
                                                                            onClick={() => setSelectedCustomerForCredentials(c)}
                                                                        >
                                                                            <i className="ri-key-2-line me-1"></i>
                                                                            {hasLogin ? 'Reset Login' : 'Generate Login'}
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-secondary disabled opacity-50"
                                                                            title="Approve Customer first to enable login generation"
                                                                            disabled
                                                                        >
                                                                            <i className="ri-lock-line me-1"></i> Generate Login
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4 text-muted">
                                                        <i className="ri-user-shared-line fs-32 d-block mb-1 text-secondary"></i>
                                                        No Customers found. Click "Onboard New Customer" to register one.
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
                        {editingCustomer && (
                            <div className="col-12 mb-3">
                                <div className="alert alert-warning d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="ri-edit-line me-2"></i>
                                        Editing Customer: <strong>{editingCustomer.name || editingCustomer.user?.name || 'Customer'}</strong>
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

                        {/* Section 1: Personal & Contact Information */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-user-line me-2 text-primary"></i>
                                        Customer Personal & Contact Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="name" className="form-label">
                                                Customer Full Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="e.g. Ramesh Sharma"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>

                                        <div className="col-md-6">
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

                                        <div className="col-md-6">
                                            <label htmlFor="email" className="form-label">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="customer@example.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="profile_pic" className="form-label">
                                                Profile Photo
                                            </label>
                                            <input
                                                type="file"
                                                id="profile_pic"
                                                className={`form-control ${errors.profile_pic ? 'is-invalid' : ''}`}
                                                accept=".jpg,.jpeg,.png"
                                                onChange={(e) => setData('profile_pic', e.target.files[0])}
                                            />
                                            {errors.profile_pic && <div className="invalid-feedback">{errors.profile_pic}</div>}
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
                                        Address & Location
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
                                                placeholder="House no., Building, Street, Landmark, Area"
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
                                            <label htmlFor="zip" className="form-label">Pincode / Zip</label>
                                            <input
                                                type="text"
                                                id="zip"
                                                className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
                                                placeholder="e.g. 400001"
                                                value={data.zip}
                                                onChange={(e) => setData('zip', e.target.value)}
                                            />
                                            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
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

                        {/* Section 3: Identity & KYC Documents (Optional) */}
                        <div className="col-12 mb-3">
                            <div className="card">
                                <div className="card-header border-bottom border-light">
                                    <h5 className="header-title mb-0">
                                        <i className="ri-shield-check-line me-2 text-primary"></i>
                                        Identity & KYC (Optional)
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="aadhaar" className="form-label">Aadhaar Number</label>
                                            <input
                                                type="text"
                                                id="aadhaar"
                                                className={`form-control ${errors.aadhaar ? 'is-invalid' : ''}`}
                                                placeholder="12-digit Aadhaar number"
                                                value={data.aadhaar}
                                                onChange={(e) => setData('aadhaar', e.target.value)}
                                            />
                                            {errors.aadhaar && <div className="invalid-feedback">{errors.aadhaar}</div>}
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="pan" className="form-label">PAN Card Number</label>
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
                                            <label htmlFor="aadhaar_doc" className="form-label">Aadhaar Document</label>
                                            <input
                                                type="file"
                                                id="aadhaar_doc"
                                                className={`form-control ${errors.aadhaar_doc ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setData('aadhaar_doc', e.target.files[0])}
                                            />
                                            {errors.aadhaar_doc && <div className="invalid-feedback">{errors.aadhaar_doc}</div>}
                                        </div>

                                        <div className="col-md-6">
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
                                    {processing ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Submit & Onboard Customer'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-light px-4 py-2"
                                    onClick={() => {
                                        if (editingCustomer) {
                                            handleCancelEdit();
                                        } else {
                                            reset();
                                        }
                                    }}
                                >
                                    {editingCustomer ? 'Cancel' : 'Reset'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* MODAL: GENERATE LOGIN CREDENTIALS */}
            {selectedCustomerForCredentials && (
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
                                        onClick={() => setSelectedCustomerForCredentials(null)}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <div className="alert alert-light border">
                                        <div><strong>Customer Name:</strong> {selectedCustomerForCredentials.name || selectedCustomerForCredentials.user?.name}</div>
                                        <div><strong>Login ID (Mobile):</strong> {selectedCustomerForCredentials.mobile || selectedCustomerForCredentials.user?.mobile}</div>
                                        <div><strong>Email:</strong> {selectedCustomerForCredentials.email || selectedCustomerForCredentials.user?.email || '—'}</div>
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
                                            The customer will use their <strong>Mobile Number ({selectedCustomerForCredentials.mobile || selectedCustomerForCredentials.user?.mobile})</strong> or <strong>Email</strong> to login.
                                        </small>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedCustomerForCredentials(null)}
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
            </div>
        </AdminLayout>
    );
}
