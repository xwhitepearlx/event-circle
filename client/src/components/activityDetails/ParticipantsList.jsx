import ParticipantItem from "./ParticipantItem";

const ParticipantsList = ({ activity }) => {
  if (!activity) return null;

  return (
    <div className="card p-4 shadow">
      <h4>Participants ({activity.participants.length})</h4>

      <ul className="list-group">
        {activity.participants.map((p, i) => (
          <ParticipantItem
            key={i}
            participant={p}
            activity={activity}
          />
        ))}
      </ul>
    </div>
  );
};

export default ParticipantsList;