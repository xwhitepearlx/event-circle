const ActivityForm = ({
  formData,
  handleChange,
  onSubmit,
  onFinalizeToggle,
  isFinalized,
  mode = "create", // "create" or "edit"
}) => {
  return (
    <div className="card p-4 shadow">
      <h3>{mode === "create" ? "Create Activity" : "Edit Activity"}</h3>

      {/* Event Title */}
      <div className="mb-3">
        <label className="form-label">
          Event Title <span className="text-danger">*</span>
        </label>
        <input
          className="form-control"
          value={formData.eventTitle}
          onChange={(e) => handleChange("eventTitle", e.target.value)}
          required
        />
      </div>

      {/* Event Date & Time (Required) */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">
            Event Date <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={formData.eventDate}
            onChange={(e) => handleChange("eventDate", e.target.value)}
            required
            min={new Date().toISOString().split("T")[0]} // Prevent past dates
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">
            Event Time <span className="text-danger">*</span>
          </label>
          <input
            type="time"
            className="form-control"
            value={formData.eventTime}
            onChange={(e) => handleChange("eventTime", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Voting Deadline Date & Time (Optional) */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Voting Deadline Date (Optional)</label>
          <input
            type="date"
            className="form-control"
            value={formData.votingDate}
            onChange={(e) => handleChange("votingDate", e.target.value)}
            disabled={isFinalized && mode === "create"}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Voting Deadline Time (Optional)</label>
          <input
            type="time"
            className="form-control"
            value={formData.votingTime}
            onChange={(e) => handleChange("votingTime", e.target.value)}
            disabled={isFinalized && mode === "create"}
          />
        </div>
        <small className="text-muted mt-1">
          Leave empty for no voting deadline. Must be before event time.
        </small>
      </div>

      {/* Finalize checkbox (only in create mode) */}
      {mode === "create" && (
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="isFinalized"
            checked={isFinalized}
            onChange={(e) => onFinalizeToggle(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="isFinalized">
            <strong>Finalize immediately (skip voting)</strong>
          </label>
          <div className="form-text">
            If checked, event details will be locked immediately. No voting
            period.
            {isFinalized && " Voting fields are disabled."}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">
          Location <span className="text-danger">*</span>
        </label>
        <input
          className="form-control"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          required
        />
      </div>

      {/* Cost */}
      <div className="mb-3">
        <label className="form-label">Cost</label>
        <input
          className="form-control"
          value={formData.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
          placeholder="e.g., Free, $20, TBD"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your event..."
        ></textarea>
      </div>

      {/* Agenda */}
      <div className="mb-3">
        <label className="form-label">Agenda</label>
        <textarea
          className="form-control"
          rows={2}
          value={formData.agenda}
          onChange={(e) => handleChange("agenda", e.target.value)}
          placeholder="Event schedule or plan..."
        ></textarea>
      </div>

      {/* What to Bring */}
      <div className="mb-3">
        <label className="form-label">What to Bring (comma separated)</label>
        <input
          className="form-control"
          value={formData.whatToBring}
          onChange={(e) => handleChange("whatToBring", e.target.value)}
          placeholder="e.g., swimsuit, towel, sunscreen"
        />
      </div>

      {/* What's Provided */}
      <div className="mb-3">
        <label className="form-label">What's Provided (comma separated)</label>
        <input
          className="form-control"
          value={formData.whatsProvided}
          onChange={(e) => handleChange("whatsProvided", e.target.value)}
          placeholder="e.g., food, drinks, equipment"
        />
      </div>

      {/* Contact Info */}
      <div className="mb-3">
        <label className="form-label">Contact Info</label>
        <input
          className="form-control"
          value={formData.contactInfo}
          onChange={(e) => handleChange("contactInfo", e.target.value)}
          placeholder="Phone number, email, or other contact details"
        />
      </div>

      <button className="btn btn-primary mt-3" onClick={onSubmit}>
        {mode === "create" ? "Create Activity" : "Save Changes"}
      </button>
    </div>
  );
};

export default ActivityForm;
