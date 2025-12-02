const AvailabilityEditor = ({
  availability,
  setAvailability,
  isActivelyParticipating,
  onSaveAvailability,
}) => {
  if (!isActivelyParticipating) return null;

  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h5>Your Availability</h5>

      <input
        className="form-control mb-2"
        placeholder="e.g. Tue 5PM, Fri night"
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
      />

      <button className="btn btn-primary" onClick={onSaveAvailability}>
        Save Availability
      </button>
    </div>
  );
};

export default AvailabilityEditor;
