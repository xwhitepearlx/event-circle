const ActivityForm = ({ formData, setFormData, onSubmit }) => {
  return (
    <div className="card p-4 shadow">
      <h3>Create Activity</h3>

      {/* Event Title */}
      <div className="mb-3">
        <label className="form-label">Event Title</label>
        <input
          className="form-control"
          value={formData.eventTitle}
          onChange={(e) =>
            setFormData({ ...formData, eventTitle: e.target.value })
          }
        />
      </div>

      {/* Event Date */}
      <div className="mb-3">
        <label className="form-label">Event Date</label>
        <input
          type="date"
          className="form-control"
          value={formData.eventDate}
          onChange={(e) =>
            setFormData({ ...formData, eventDate: e.target.value })
          }
        />
      </div>

      {/* Voting Deadline */}
      <div className="mb-3">
        <label className="form-label">Voting Deadline (optional)</label>
        <input
          type="date"
          className="form-control"
          value={formData.votingDate}
          onChange={(e) =>
            setFormData({ ...formData, votingDate: e.target.value })
          }
        />
      </div>

      {/* Location */}
      <div className="mb-3">
        <label className="form-label">Location</label>
        <input
          className="form-control"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>

      {/* Cost */}
      <div className="mb-3">
        <label className="form-label">Cost</label>
        <input
          className="form-control"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        ></textarea>
      </div>

      {/* Agenda */}
      <div className="mb-3">
        <label className="form-label">Agenda</label>
        <textarea
          className="form-control"
          rows={2}
          value={formData.agenda}
          onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
        ></textarea>
      </div>

      {/* What to Bring */}
      <div className="mb-3">
        <label className="form-label">What to Bring (comma separated)</label>
        <input
          className="form-control"
          value={formData.whatToBring}
          onChange={(e) =>
            setFormData({ ...formData, whatToBring: e.target.value })
          }
        />
      </div>

      {/* What's Provided */}
      <div className="mb-3">
        <label className="form-label">What's Provided (comma separated)</label>
        <input
          className="form-control"
          value={formData.whatsProvided}
          onChange={(e) =>
            setFormData({ ...formData, whatsProvided: e.target.value })
          }
        />
      </div>

      {/* Contact Info */}
      <div className="mb-3">
        <label className="form-label">Contact Info</label>
        <input
          className="form-control"
          value={formData.contactInfo}
          onChange={(e) =>
            setFormData({ ...formData, contactInfo: e.target.value })
          }
        />
      </div>

      <button className="btn btn-primary mt-3" onClick={onSubmit}>
        Create Activity
      </button>
    </div>
  );
};

export default ActivityForm;
