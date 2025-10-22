import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
const Sidebar = () => {
  const navigate = useNavigate();

  const handleTechClick = () => {
    navigate("/tech");
  };

  return (
    <div className="sidebar bg-light p-4">
      <h3>Documentation</h3>
      <ul className="list-unstyled">
        <li>
          <button onClick={() => navigate("/quick-start")}>Quick Start</button>
        </li>
        <li>
          <button onClick={() => navigate("/installation")}>
            Installation
          </button>
        </li>
        <li>
          <button onClick={handleTechClick}>Tech</button>
        </li>
        <li>
          <button onClick={() => navigate("/faq")}>FAQ</button>
        </li>
        <li>
          <button onClick={() => navigate("/troubleshooting")}>
            Troubleshooting
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
