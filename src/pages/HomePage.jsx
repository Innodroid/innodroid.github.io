import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="jumbotron main">
            <h1>innodroid</h1>
            <div className="links">
                <a href="mailto:admin@innodroid.com">Contact</a> |{' '}
                <Link to="/testimonials">Testimonials</Link> |{' '}
                <Link to="/careers">Careers</Link>
            </div>
        </div>
    );
}

export default HomePage;
