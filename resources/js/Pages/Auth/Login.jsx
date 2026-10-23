import AbhiLayout from '@/Layouts/AbhiLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AbhiLayout>
            <Head title="Log In" />

            <h4 className="fw-semibold mb-2 fs-18">Log in to your account</h4>
            <p className="text-muted mb-4">
                Enter your email address and password to access admin panel.
            </p>

            {status && (
                <div className="alert alert-success mb-3" role="alert">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="text-start mb-3">
                <div className="mb-3">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Enter your email"
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && (
                        <div className="invalid-feedback d-block mt-1">
                            {errors.email}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && (
                        <div className="invalid-feedback d-block mt-1">
                            {errors.password}
                        </div>
                    )}
                </div>

                <div className="d-flex justify-content-between mb-3">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            name="remember"
                            id="checkbox-signin"
                            className="form-check-input"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="checkbox-signin">
                            Remember me
                        </label>
                    </div>

                    {/* {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-muted border-bottom border-dashed"
                        >
                            Forget Password
                        </Link>
                    )} */}
                </div>

                <div className="d-grid">
                    <button
                        className="btn btn-primary fw-semibold"
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </form>

            {/* <p className="text-muted fs-14 mb-4">
                Don't have an account?{' '}
                <Link href="#" className="fw-semibold text-danger ms-1">
                    Sign Up !
                </Link>
            </p> */}
        </AbhiLayout>
    );
}
