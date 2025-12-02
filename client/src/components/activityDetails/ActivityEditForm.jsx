const ActivityEditForm = ({
  activity,
  editForm,
  setEditForm,
  onSave,
  onCancel,
}) => {
  if (!activity) return null;

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow mb-4">
        <h4>Edit Activity</h4>

        {/* Warning about locked fields */}
        {activity.isFinalized && (
          <p className="text-muted small mb-3">
            <strong>Note:</strong> This event is finalized. Event date,
            location, and voting date are locked.
          </p>
        )}

        {/* Event Title */}
        <div className="mb-3">
          <label className="form-label">Event Title</label>
          <input
            className="form-control"
            value={editForm.eventTitle}
            onChange={(e) =>
              setEditForm({ ...editForm, eventTitle: e.target.value })
            }
          />
        </div>

        {/* Event Date */}
        <div className="mb-3">
          <label className="form-label">Event Date</label>
          <input
            type="date"
            className="form-control"
            value={editForm.eventDate}
            disabled={activity.isFinalized}
            onChange={(e) =>
              setEditForm({ ...editForm, eventDate: e.target.value })
            }
          />
        </div>

        {/* Voting Deadline */}
        <div className="mb-3">
          <label className="form-label">Voting Deadline</label>
          <input
            type="date"
            className="form-control"
            value={editForm.votingDate}
            disabled={activity.isFinalized}
            onChange={(e) =>
              setEditForm({ ...editForm, votingDate: e.target.value })
            }
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="form-label">Location</label>
          <input
            className="form-control"
            value={editForm.location}
            disabled={activity.isFinalized}
            onChange={(e) =>
              setEditForm({ ...editForm, location: e.target.value })
            }
          />
        </div>

        {/* Cost */}
        <div className="mb-3">
          <label className="form-label">Cost</label>
          <input
            className="form-control"
            value={editForm.cost}
            onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          ></textarea>
        </div>

        {/* Agenda */}
        <div className="mb-3">
          <label className="form-label">Agenda</label>
          <textarea
            className="form-control"
            rows={3}
            value={editForm.agenda}
            onChange={(e) =>
              setEditForm({ ...editForm, agenda: e.target.value })
            }
          ></textarea>
        </div>

        {/* What to Bring */}
        <div className="mb-3">
          <label className="form-label">What to Bring (comma separated)</label>
          <input
            className="form-control"
            value={editForm.whatToBring}
            onChange={(e) =>
              setEditForm({ ...editForm, whatToBring: e.target.value })
            }
          />
        </div>

        {/* What's Provided */}
        <div className="mb-3">
          <label className="form-label">
            What's Provided (comma separated)
          </label>
          <input
            className="form-control"
            value={editForm.whatsProvided}
            onChange={(e) =>
              setEditForm({ ...editForm, whatsProvided: e.target.value })
            }
          />
        </div>

        {/* Contact Info */}
        <div className="mb-3">
          <label className="form-label">Contact Info</label>
          <input
            className="form-control"
            value={editForm.contactInfo}
            onChange={(e) =>
              setEditForm({ ...editForm, contactInfo: e.target.value })
            }
          />
        </div>

        {/* Buttons */}
        <div className="d-flex gap-3 mt-3">
          <button className="btn btn-primary" onClick={onSave}>
            Save Changes
          </button>

          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityEditForm;
