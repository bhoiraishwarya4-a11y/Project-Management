
import React, { useState } from "react";
import { createProject } from "../api/projectAPI";
import "./AddProject.css";

const initialForm = {
  ProjectName: "",
  Department: "",
  Priority: "Medium",
  StartDate: "",
  EndDate: "",
  status: "Pending",
};

const AddProject = ({ onProjectAdded, onCancel }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.EndDate < form.StartDate) {
      setError("End date must be after the start date.");
      return;
    }

    try {
      setSaving(true);

      const newProject = await createProject(form);

      setSuccess("Project created successfully!");
      setForm(initialForm);

      if (onProjectAdded) {
        onProjectAdded(newProject);
      }
    } catch (err) {
      console.error("Create project error:", err);
      setError("Unable to create project. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="add-project-section">
      <div className="add-project-heading">
        <div>
          <span className="form-eyebrow">PROJECT WORKSPACE</span>
          <h2>Create New Project</h2>
          <p>Enter the details below to add a project.</p>
        </div>

        {onCancel && (
          <button
            type="button"
            className="form-close-btn"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close project form"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="form-alert form-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="form-alert form-success" role="status">
          {success}
        </div>
      )}

      <form className="add-project-form" onSubmit={handleSubmit}>
        <div className="form-field form-field-full">
          <label htmlFor="ProjectName">Project Name *</label>
          <input
            id="ProjectName"
            name="ProjectName"
            type="text"
            placeholder="e.g. Website Redesign"
            value={form.ProjectName}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="Department">Department *</label>
          <input
            id="Department"
            name="Department"
            type="text"
            placeholder="e.g. Development"
            value={form.Department}
            onChange={handleChange}
            maxLength={80}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="Priority">Priority *</label>
          <select
            id="Priority"
            name="Priority"
            value={form.Priority}
            onChange={handleChange}
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="StartDate">Start Date *</label>
          <input
            id="StartDate"
            name="StartDate"
            type="date"
            value={form.StartDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="EndDate">End Date *</label>
          <input
            id="EndDate"
            name="EndDate"
            type="date"
            min={form.StartDate || undefined}
            value={form.EndDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field form-field-full">
          <label htmlFor="status">Initial Status *</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="Pending">Pending</option>
            <option value="In-progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-actions form-field-full">
          {onCancel && (
            <button
              type="button"
              className="form-cancel-btn"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="form-submit-btn"
            disabled={saving}
          >
            {saving ? "Creating..." : "+ Create Project"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddProject;
