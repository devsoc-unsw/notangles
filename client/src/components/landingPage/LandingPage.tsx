const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="max-w-4xl mx-auto p-8">
                <header className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Notangles</h1>
                    <p className="text-md text-gray-700 mb-8">For all your timetabling needs</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Get Started
                    </button>
                </header>
                <section className="mt-12">
                    <h2 className="text-4xl font-bold mb-4">Features</h2>
                </section>
            </div>
        </div>
    );
};

export default LandingPage;
