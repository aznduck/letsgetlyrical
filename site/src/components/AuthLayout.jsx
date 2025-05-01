export const AuthLayout = ({ children }) => {
    return (
        <div className="auth-container" role="main">
            <header className="logo-container">
                <img src="/images/logo_xL_64.png"
                     alt="Let's get lyrical! Neon Logo"
                     width={250} height={80}
                     className="auth-logo"
                />
            </header>

            {children}

            <footer className="team-label-container">
                <img src="/images/TeamLabel_L.png"
                     alt="Team 23 Neon Sign"
                     width={150} height={60}
                     className="team-label"
                />
            </footer>
        </div>
    )
}