export const AuthLayout = ({ children }) => {
    return (
        <div className="auth-container">
            <div className="logo-container">
                <img src="/images/logo_xL_64.png"
                     alt="Let's get lyrical!"
                     width={250} height={80}
                     className="auth-logo"
                />
            </div>

            {children}

            <div className="team-label-container">
                <img src="/images/TeamLabel_L.png"
                     alt="Team 23"
                     width={150} height={60}
                     className="team-label"
                />
            </div>
        </div>
    )
}