export const UrgencyBadge = ({ value }) => <span className={`badge urg-${String(value).toLowerCase()}`}>{value}</span>;
export const StatusBadge = ({ value }) => <span className={`badge st-${String(value).toLowerCase()}`}>{value}</span>;
export const CategoryBadge = ({ value }) => <span className="badge cat">{value}</span>;
export const ImplBadge = ({ value }) => <span className={`badge impl-${String(value).toLowerCase()}`}>{value}</span>;
