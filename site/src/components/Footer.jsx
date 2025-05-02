function Footer() {
    return (
        <footer className="footer" role="contentinfo">
            <div className="footer-container">
                <div className="footer-logo">
                    <img src="/images/TeamLabel_L.png" alt="TEAM 23 logo" className="team-logo" />
                </div>

                <div className="details-container">
                    <div className="footer-section">
                        <h3 className="footer-heading" id="about-heading">
                            ABOUT
                        </h3>
                        <ul className="footer-list" aria-labelledby="about-heading">
                            <li>Let's Get Lyrical!</li>
                            <li>USC Spring 2025</li>
                            <li>For CSCI 310</li>
                            <li>Prof. William Halfond</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading" id="team-heading">
                            MADE BY
                        </h3>
                        <ul className="footer-list" aria-labelledby="team-heading">
                            <li>Malia Hotan</li>
                            <li>David Han</li>
                            <li>Vito Zhou</li>
                            <li>Felix Chen</li>
                            <li>Johnson Gao</li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-heading" id="tech-heading">
                            CREATED WITH
                        </h3>
                        <ul className="footer-list" aria-labelledby="tech-heading">
                            <li>Figma</li>
                            <li>React JS</li>
                            <li>Java</li>
                            <li>Genius API</li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer