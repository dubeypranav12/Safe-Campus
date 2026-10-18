import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container narrow section">
      <div className="card empty">
        <h1>Page not found</h1>
        <p>That page does not exist in the SafeCampus prototype.</p>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
