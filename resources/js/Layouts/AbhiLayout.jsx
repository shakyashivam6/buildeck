import { Link } from '@inertiajs/react';

export default function AbhiLayout({ children }) {
    return (
        <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
            <div className="row g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
                <div className="col-xl-4 col-lg-5 col-md-6">
                    <div className="card overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
                        <Link href="/" className="auth-brand mb-4">
                            <img src="/assets/images/logo-dark.png" alt="dark logo" height="26" className="logo-dark" />
                            <img src="/assets/images/logo.png" alt="logo light" height="26" className="logo-light" />
                        </Link>

                        {children ? (
                            children
                        ) : (
                            <>
                                <h4 className="fw-semibold mb-2 fs-18">Log in to your account</h4>

                                <p className="text-muted mb-4">
                                    Enter your email address and password to access admin panel.
                                </p>

                                <form className="text-start mb-3" onSubmit={(e) => e.preventDefault()}>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="example-email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="example-email"
                                            name="example-email"
                                            className="form-control"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="example-password">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="example-password"
                                            className="form-control"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between mb-3">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="checkbox-signin"
                                            />
                                            <label className="form-check-label" htmlFor="checkbox-signin">
                                                Remember me
                                            </label>
                                        </div>

                                        <Link
                                            href={typeof route !== 'undefined' ? route('password.request') : '/forgot-password'}
                                            className="text-muted border-bottom border-dashed"
                                        >
                                            Forget Password
                                        </Link>
                                    </div>

                                    <div className="d-grid">
                                        <button className="btn btn-primary fw-semibold" type="submit">
                                            Login
                                        </button>
                                    </div>
                                </form>

                                <p className="text-muted fs-14 mb-4">
                                    Don't have an account?{' '}
                                    <Link
                                        href={typeof route !== 'undefined' ? route('register') : '/register'}
                                        className="fw-semibold text-danger ms-1"
                                    >
                                        Sign Up !
                                    </Link>
                                </p>
                            </>
                        )}

                        <p className="mt-auto mb-0">
                            {new Date().getFullYear()} © Highdmin - By{' '}
                            <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">
                                Coderthemes
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
