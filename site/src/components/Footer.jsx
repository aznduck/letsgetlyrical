function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <img
                        src="/images/TeamLabel_L.png"
                        alt="TEAM 23"
                        className="team-logo"
                    />
                </div>

                <div className="details-container">
                    <div className="footer-section">
                        <h3 className="footer-heading">ABOUT</h3>
                        <ul className="footer-list">
                            <li>USC Spring 2025</li>
                            <li>For CSCI 310</li>
                            <li>Professor William Halfond</li>
                            <li>?</li>
                            <li>?</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">MADE BY</h3>
                        <ul className="footer-list">
                            <li>Malia Hotan</li>
                            <li>David Han</li>
                            <li>Vito Zhou</li>
                            <li>Felix Chen</li>
                            <li>Johnson Gao</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading">CREATED WITH</h3>
                        <ul className="footer-list">
                            <li>Figma</li>
                            <li>React JS</li>
                            <li>Java</li>
                            <li>Genius API</li>
                            <li>??</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer