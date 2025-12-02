import { useEffect, useState } from "react";
import { getActivities, deleteActivity } from "../api/services/activities";
import ActivityItem from "../components/activities/ActivityItem";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const loadActivities = async () => {
    try {
      const { data } = await getActivities();
      setActivities(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading activities:", err);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Delete rules
  const canDelete = (activity) => {
    const isCreator = String(activity.createdBy?._id) === String(userId);

    if (!isCreator) return false;

    const creatorOnly =
      activity.participants.length === 1 &&
      String(activity.participants[0].user?._id) === String(userId);

    const cancelled7Days =
      activity.isCancelled &&
      activity.cancelledAt &&
      new Date(activity.cancelledAt).getTime() <
        Date.now() - 7 * 24 * 60 * 60 * 1000;

    return creatorOnly || cancelled7Days;
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;

    try {
      await deleteActivity(activityId, userId);
      setActivities((prev) => prev.filter((a) => a._id !== activityId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="container mt-4">
      <h2>Your Activities</h2>

      <div className="row mt-3">
        {activities.map((activity) => (
          <ActivityItem
            key={activity._id}
            activity={activity}
            userId={userId}
            formatDate={formatDate}
            canDelete={canDelete(activity)}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Activities;
