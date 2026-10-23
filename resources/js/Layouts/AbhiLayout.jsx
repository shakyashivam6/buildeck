import { Link } from '@inertiajs/react';

export default function AbhiLayout({ children }) {
    const appName = import.meta.env.VITE_APP_NAME || 'BuilDeck';

    return (
        <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
            <div className="row g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
                <div className="col-xl-4 col-lg-5 col-md-6">
                    <div className="card overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
                        <Link href="/" className="auth-brand mb-4">
                            <img src="/assets/images/logo-dark.png" alt="dark logo" height="26" className="logo-dark" />
                            <img src="/assets/images/logo.png" alt="logo light" height="26" className="logo-light" />
                        </Link>

                        {children}

                        <p className="mt-auto mb-0">
                            {new Date().getFullYear()} © {appName} - By{' Abhishek '}
                            <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">
                                Ferry Infotech
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}