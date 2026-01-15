function Layout({ children }) {
    return (
        <>
            <div id="body">
                <div className="container">
                    {children}
                </div>
            </div>
            <div className="container"></div>
        </>
    );
}

export default Layout;
