import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
    return (
        <div>
            <Routes>
                {/* Root pages, located in /pages/ */}

                {/* 404 page not found redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;