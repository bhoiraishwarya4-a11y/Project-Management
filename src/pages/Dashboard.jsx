
import React, { useEffect, useMemo, useState } from "react";
import {
  getAllProjects,
  updateStatus,
  deleteProject,
} from "../api/projectAPI";
import AddProject from "../components/AddProject";
import "./Dashboard.css";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({});
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notice, setNotice] = useState("");

  // Dark Mode / Light Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("dashboard-theme") === "dark";
  });

  // Save theme when it changes
  useEffect(() => {
    localStorage.setItem(
      "dashboard-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Fetch all projects
  async function fetchAllData() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllProjects();
      const list = Array.isArray(data) ? data : [];

      setProjects(list);

      const statusMap = {};
      list.forEach((project) => {
        statusMap[project.id] = project.status || "Pending";
      });

      setStatus(statusMap);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError("Projects load झाले नाहीत. कृपया पुन्हा प्रयत्न कर.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  // Get project name
  function getName(project) {
    return (
      project.ProjectName ||
      project.projectName ||
      project.name ||
      "Untitled Project"
    );
  }

  // Get project priority
  function getPriority(project) {
    const value = project.Priority || project.priority || "Medium";
    const normalized = String(value).toLowerCase();

    if (normalized === "high") return "High";
    if (normalized === "low") return "Low";

    return "Medium";
  }

  // Get project status
  function getProjectStatus(project) {
    return project.status || "Pending";
  }

  // Search and priority filter
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const name = getName(project).toLowerCase();

      const department = String(
        project.Department || project.department || ""
      ).toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.includes(searchValue) ||
        department.includes(searchValue);

      const matchesPriority =
        filterPriority === "All" ||
        getPriority(project) === filterPriority;

      return matchesSearch && matchesPriority;
    });
  }, [projects, search, filterPriority]);

  // Dashboard statistics
  const completedCount = projects.filter(
    (project) => getProjectStatus(project) === "Completed"
  ).length;

  const inProgressCount = projects.filter(
    (project) => getProjectStatus(project) === "In-progress"
  ).length;

  const pendingCount = projects.filter(
    (project) =>
      !project.status || getProjectStatus(project) === "Pending"
  ).length;

  // Update project status
  async function handleStatusUpdate(project) {
    const newStatus = status[project.id] || "Pending";

    if (newStatus === getProjectStatus(project)) return;

    try {
      setSavingId(project.id);
      setError("");
      setNotice("");

      const updatedProject = await updateStatus(project.id, {
        status: newStatus,
      });

      setProjects((previous) =>
        previous.map((item) =>
          item.id === project.id
            ? { ...item, ...updatedProject, status: newStatus }
            : item
        )
      );

      setNotice("Project status updated successfully!");
    } catch (err) {
      console.error("Update status error:", err);
      setError("Status update झाला नाही. पुन्हा प्रयत्न कर.");

      setStatus((previous) => ({
        ...previous,
        [project.id]: getProjectStatus(project),
      }));
    } finally {
      setSavingId(null);
    }
  }

  // Delete project
  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${getName(project)}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(project.id);
      setError("");
      setNotice("");

      await deleteProject(project.id);

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );

      setStatus((previous) => {
        const updated = { ...previous };
        delete updated[project.id];
        return updated;
      });

      setNotice("Project deleted successfully!");
    } catch (err) {
      console.error("Delete project error:", err);
      setError("Project delete झाला नाही. पुन्हा प्रयत्न कर.");
    } finally {
      setDeletingId(null);
    }
  }

  // Add newly created project
  function handleProjectAdded(newProject) {
    setProjects((previous) => [newProject, ...previous]);

    setStatus((previous) => ({
      ...previous,
      [newProject.id]: newProject.status || "Pending",
    }));

    setShowAddForm(false);
    setNotice("New project added successfully!");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Format dates
  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date).slice(0, 10);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main
      className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}
    >
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <span className="header-eyebrow">
            PROJECT MANAGEMENT
          </span>

          <h1>Project Dashboard</h1>

          <p>
            Manage your projects, track progress and stay organized.
          </p>
        </div>

        <div className="header-actions">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setDarkMode((previous) => !previous)}
            aria-pressed={darkMode}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {/* Refresh */}
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchAllData}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          {/* Add Project */}
          <button
            type="button"
            className="add-project-btn"
            onClick={() => {
              setShowAddForm((previous) => !previous);
              setNotice("");
            }}
          >
            {showAddForm ? "✕ Close Form" : "+ Add New Project"}
          </button>
        </div>
      </header>

      {/* Success Message */}
      {notice && (
        <div className="dashboard-notice" role="status">
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Project Form */}
      {showAddForm && (
        <AddProject
          onProjectAdded={handleProjectAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Statistics */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon stat-icon-purple">▦</div>
          <div>
            <p>Total Projects</p>
            <h2>{projects.length}</h2>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-orange">◷</div>
          <div>
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-blue">↗</div>
          <div>
            <p>In Progress</p>
            <h2>{inProgressCount}</h2>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-green">✓</div>
          <div>
            <p>Completed</p>
            <h2>{completedCount}</h2>
          </div>
        </article>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="projects-heading">
          <div>
            <h2>All Projects</h2>
            <p>View and manage all your projects in one place.</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="filters-row">
          <div className="search-box">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search by project or department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>

          <select
            className="priority-filter"
            value={filterPriority}
            onChange={(event) => setFilterPriority(event.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="dashboard-error" role="alert">
            {error}

            <button type="button" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="dashboard-loading">
            <span className="loading-spinner"></span>
            <p>Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-icon">▦</div>

            <h3>
              {projects.length === 0
                ? "No projects yet"
                : "No matching projects"}
            </h3>

            <p>
              {projects.length === 0
                ? "Create your first project to get started."
                : "Try changing your search or priority filter."}
            </p>

            {projects.length === 0 && (
              <button
                type="button"
                className="add-project-btn"
                onClick={() => setShowAddForm(true)}
              >
                + Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Projects Table */}
            <div className="table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => {
                    const currentStatus =
                      status[project.id] || getProjectStatus(project);

                    return (
                      <tr key={project.id}>
                        <td className="project-name-cell">
                          <strong>{getName(project)}</strong>
                        </td>

                        <td>
                          {project.Department ||
                            project.department ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`priority-badge priority-${getPriority(
                              project
                            ).toLowerCase()}`}
                          >
                            {getPriority(project)}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            project.StartDate || project.startDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            project.EndDate || project.endDate
                          )}
                        </td>

                        <td>
                          <select
                            className="status-select"
                            value={currentStatus}
                            onChange={(event) =>
                              setStatus((previous) => ({
                                ...previous,
                                [project.id]: event.target.value,
                              }))
                            }
                            aria-label={`Status for ${getName(project)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In-progress">
                              In Progress
                            </option>
                            <option value="Completed">Completed</option>
                          </select>

                          <button
                            type="button"
                            className="update-status-btn"
                            onClick={() => handleStatusUpdate(project)}
                            disabled={
                              savingId === project.id ||
                              currentStatus === getProjectStatus(project)
                            }
                          >
                            {savingId === project.id
                              ? "Saving..."
                              : "Update"}
                          </button>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDelete(project)}
                            disabled={deletingId === project.id}
                          >
                            {deletingId === project.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            <div className="results-count">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default Dashboard;

