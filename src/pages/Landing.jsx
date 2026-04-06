import { useNavigate } from "react-router-dom";

function LogoMark({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="18" r="9" fill="#111111" />
            <circle cx="23" cy="12" r="8" fill="#3D3580" />
            <circle cx="23" cy="24" r="8" fill="#2A2A2A" />
            <circle cx="13" cy="18" r="4" fill="#F5F5F5" />
        </svg>
    );
}

const FEATURES = [
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
        ),
        title: "Textbooks & Notes",
        desc: "Find the exact edition you need from students who just finished that course.",
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
            </svg>
        ),
        title: "Electronics & Gadgets",
        desc: "Laptops, calculators, lab equipment — rent for a semester instead of buying.",
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
        ),
        title: "Instruments & Tools",
        desc: "Musical instruments, workshop tools — borrow for your project, return when done.",
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
        ),
        title: "Direct Messaging",
        desc: "Chat with the owner, negotiate price, and close the deal — all inside UniPool.",
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: "Campus Only",
        desc: "Exclusively for RGUKT students — a trusted, closed community you can rely on.",
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
        ),
        title: "Buy or Rent",
        desc: "Flexible options — buy outright or rent for a fixed period. Your choice.",
    },
];

const HOW_IT_WORKS = [
    { step: "01", title: "Create an account", desc: "Sign up with your RGUKT email in under a minute." },
    { step: "02", title: "List or browse", desc: "Post items you don't need or discover what peers are offering." },
    { step: "03", title: "Chat & close", desc: "Message directly, agree on terms, and meet on campus." },
];

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg text-primary overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
                    <div className="flex items-center gap-2.5">
                        <LogoMark size={28} />
                        <span className="text-base font-bold text-primary tracking-tight font-display">
                            UniPool
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm text-muted hover:text-primary transition-colors duration-150 px-3 py-1.5"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="text-sm bg-purple hover:bg-[#5a52b8] text-white font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
                        >
                            Get started
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-20 text-center">
                {/* Background glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(61,53,128,0.22) 0%, transparent 70%)",
                    }}
                />

                {/* Badge */}
                <div className="animate-fade-up inline-flex items-center gap-2 bg-purple/10 border border-purple/20 rounded-full px-4 py-1.5 text-purple text-xs font-medium mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                    Exclusively for RGUKT students
                </div>

                {/* Headline */}
                <h1 className="animate-fade-up-delay-1 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-primary leading-[1.05] mb-6 relative">
                    The campus<br />
                    <span className="text-purple">marketplace</span><br />
                    you needed.
                </h1>

                {/* Sub */}
                <p className="animate-fade-up-delay-2 text-muted text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10 relative">
                    Buy, sell, and rent items within your university community.
                    Stop buying new — your senior already has what you need.
                </p>

                {/* CTA buttons */}
                <div className="animate-fade-up-delay-3 flex items-center justify-center gap-3 flex-wrap relative">
                    <button
                        onClick={() => navigate("/register")}
                        className="bg-purple hover:bg-[#5a52b8] active:scale-[0.98] text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-purple/20 font-display tracking-wide"
                    >
                        Get started — it's free
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="border border-border hover:border-primary/30 text-muted hover:text-primary px-7 py-3.5 rounded-xl text-sm transition-all duration-200 font-medium"
                    >
                        Sign in →
                    </button>
                </div>

                {/* Subtle divider */}
                <div className="mt-20 hr-gradient" />
            </section>

            {/* ── How it works ── */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
                <div className="text-center mb-12">
                    <p className="text-xs font-medium text-purple tracking-widest uppercase mb-3">
                        How it works
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary">
                        Three steps to get going
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {HOW_IT_WORKS.map(({ step, title, desc }) => (
                        <div
                            key={step}
                            className="relative bg-surface border border-border rounded-2xl p-6 overflow-hidden group hover:border-purple/25 transition-all duration-200"
                        >
                            {/* Large step number watermark */}
                            <span
                                className="absolute -top-3 -right-1 font-display text-7xl font-extrabold text-border/60 select-none pointer-events-none leading-none"
                            >
                                {step}
                            </span>
                            <div className="relative">
                                <p className="text-xs font-medium text-purple tracking-widest uppercase mb-3">
                                    Step {step}
                                </p>
                                <h3 className="font-display font-bold text-primary text-lg mb-2">{title}</h3>
                                <p className="text-muted text-sm leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
                <div className="text-center mb-12">
                    <p className="text-xs font-medium text-purple tracking-widest uppercase mb-3">
                        Features
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary">
                        Everything you need
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map(({ icon, title, desc }) => (
                        <div
                            key={title}
                            className="bg-surface border border-border rounded-2xl p-6 hover:border-purple/25 hover:bg-surface/80 transition-all duration-200 group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center text-muted group-hover:text-purple group-hover:border-purple/25 transition-all duration-200 mb-4">
                                {icon}
                            </div>
                            <h3 className="font-display font-semibold text-primary mb-1.5">{title}</h3>
                            <p className="text-muted text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA banner ── */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
                <div
                    className="relative rounded-3xl border border-purple/20 bg-surface overflow-hidden p-10 sm:p-14 text-center"
                    style={{
                        background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(61,53,128,0.15) 0%, #1C1C1C 70%)",
                    }}
                >
                    <p className="text-xs font-medium text-purple tracking-widest uppercase mb-4">
                        Ready?
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-primary mb-4 leading-tight">
                        Join your campus<br />marketplace today.
                    </h2>
                    <p className="text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
                        Sign up in 30 seconds with your college email. No fees, no middlemen — just students helping students.
                    </p>
                    <button
                        onClick={() => navigate("/register")}
                        className="bg-purple hover:bg-[#5a52b8] active:scale-[0.98] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-purple/20 font-display tracking-wide"
                    >
                        Create your account →
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-border">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <LogoMark size={22} />
                        <span className="text-sm font-bold text-primary font-display">UniPool</span>
                    </div>
                    <p className="text-xs text-muted/40 text-center">
                        Built for RGUKT students · Buy, sell & rent within campus
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-xs text-muted/60 hover:text-muted transition-colors"
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="text-xs text-purple hover:text-purple/80 transition-colors font-medium"
                        >
                            Get started →
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}