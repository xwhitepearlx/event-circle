import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getActivityById,
  joinActivity,
  leaveActivity,
  updateStatus,
  updateAvailability,
  finalizeActivity,
  cancelActivity,
  editActivity,
  deleteActivity,
} from "../api/services/activities";

import ActivityHeader from "../components/activityDetails/ActivityHeader";
import ActivityInfoCard from "../components/activityDetails/ActivityInfoCard";
import CancelledView from "../components/activityDetails/CancelledView";
import CreatorControls from "../components/activityDetails/CreatorControls";
import ParticipantsList from "../components/activityDetails/ParticipantsList";
import UserStatusBox from "../components/activityDetails/UserStatusBox";
import ParticipationButtons from "../components/activityDetails/ParticipationButtons";
import AvailabilityEditor from "../components/activityDetails/AvailabilityEditor";
import ActivityEditForm from "../components/activityDetails/ActivityEditForm";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Cancelled description edit (creator only)
  const [editDescription, setEditDescription] = useState("");

  // Availability
  const [availability, setAvailability] = useState("");

  // Fetch activity details
  const loadActivity = async () => {
    try {
      const { data } = await getActivityById(id);
      setActivity(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading activity:", err);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!activity) return <p>Activity not found.</p>;

  // Helpers
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const isCreator = String(activity.createdBy?._id) === String(userId);

  const userEntry = activity.participants.find(
    (p) => String(p.user?._id) === String(userId)
  );

  const showJoinButton = !userEntry || userEntry.status === "not_participating";

  const isActivelyParticipating =
    userEntry && userEntry.status !== "not_participating";

  // -----------------------------
  // BACKEND ACTION HANDLERS
  // -----------------------------

  const handleJoin = async () => {
    try {
      await joinActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Leave error:", err);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateStatus(id, userId, status);
      await loadActivity();
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  const handleAvailabilityUpdate = async () => {
    try {
      const availableTimes =
        availability.length > 0
          ? availability.split(",").map((s) => s.trim())
          : [];

      await updateAvailability(id, userId, availableTimes);
      await loadActivity();
    } catch (err) {
      console.error("Availability error:", err);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm("Are you sure you want to finalize this event?"))
      return;
    try {
      await finalizeActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Finalize error:", err);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm("Cancel this event? This action is permanent.")) return;
    try {
      await cancelActivity(id, userId);
      await loadActivity();
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Save description (cancelled mode only)
  const handleSaveDescription = async () => {
    try {
      await editActivity(id, {
        description: editDescription,
        userId,
      });
      setEditMode(false);
      await loadActivity();
    } catch (err) {
      console.error("Save description error:", err);
    }
  };

  // Save edit form (normal edit mode)
  const handleSaveEdit = async () => {
    try {
      // Create payload with ONLY the fields that user actually edited
      const payload = { userId };

      // Helper function to compare values properly
      const hasChanged = (newVal, originalVal, isDate = false) => {
        if (isDate) {
          const formatDateForCompare = (date) => (date ? formatDate(date) : "");
          return (
            formatDateForCompare(newVal) !== formatDateForCompare(originalVal)
          );
        }
        return newVal !== originalVal;
      };

      // Handle arrays from comma-separated strings
      const parseArrayFromString = (str) =>
        str
          ?.split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0) || [];

      const compareArrays = (arr1, arr2) =>
        JSON.stringify([...arr1].sort()) !== JSON.stringify([...arr2].sort());

      // Check each field against the original activity
      const fieldsToCheck = [
        {
          key: "eventTitle",
          value: editForm.eventTitle,
          original: activity.eventTitle,
        },
        {
          key: "description",
          value: editForm.description,
          original: activity.description,
        },
        { key: "agenda", value: editForm.agenda, original: activity.agenda },
        { key: "cost", value: editForm.cost, original: activity.cost },
        {
          key: "contactInfo",
          value: editForm.contactInfo,
          original: activity.contactInfo,
        },
      ];

      fieldsToCheck.forEach(({ key, value, original }) => {
        if (hasChanged(value, original)) {
          payload[key] = value;
        }
      });

      // Handle dates
      if (hasChanged(editForm.eventDate, activity.eventDate, true)) {
        payload.eventDate = editForm.eventDate;
      }

      if (hasChanged(editForm.votingDate, activity.votingDate, true)) {
        payload.votingDate =
          editForm.votingDate === "" ? null : editForm.votingDate;
      }

      // Handle trimmed location
      const cleanLocation = editForm.location?.trim();
      const originalLocation = activity.location?.trim();
      if (cleanLocation !== originalLocation) {
        payload.location = cleanLocation;
      }

      // Handle array fields
      const whatToBringArray = parseArrayFromString(editForm.whatToBring);
      const originalWhatToBring = activity.whatToBring || [];
      if (compareArrays(whatToBringArray, originalWhatToBring)) {
        payload.whatToBring = whatToBringArray;
      }

      const whatsProvidedArray = parseArrayFromString(editForm.whatsProvided);
      const originalWhatsProvided = activity.whatsProvided || [];
      if (compareArrays(whatsProvidedArray, originalWhatsProvided)) {
        payload.whatsProvided = whatsProvidedArray;
      }

      // If only userId is in payload, nothing changed
      if (Object.keys(payload).length === 1) {
        alert("No changes were made.");
        setEditMode(false);
        return;
      }

      await editActivity(id, payload);
      setEditMode(false);
      await loadActivity();
    } catch (err) {
      console.error("Save edit error:", err);
      alert("Failed to save: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;

    try {
      await deleteActivity(id, userId);
      navigate("/activities");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // -----------------------------
  // CANCELLED MODE
  // -----------------------------
  if (activity.isCancelled) {
    return (
      <CancelledView
        activity={activity}
        isCreator={isCreator}
        editMode={editMode}
        editDescription={editDescription}
        setEditMode={setEditMode}
        setEditDescription={setEditDescription}
        handleSaveDescription={handleSaveDescription}
        formatDate={formatDate}
        onDelete={handleDelete}
      />
    );
  }

  // -----------------------------
  // EDIT MODE
  // -----------------------------
  if (editMode) {
    return (
      <ActivityEditForm
        activity={activity}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  // -----------------------------
  // VIEW MODE
  // -----------------------------
  return (
    <div className="container mt-4">
      {/* HEADER */}
      <ActivityHeader
        activity={activity}
        userId={userId}
        formatDate={formatDate}
      />

      {/* INFO CARD */}
      <ActivityInfoCard activity={activity} formatDate={formatDate} />

      {/* CREATOR CONTROLS */}
      {isCreator && (
        <CreatorControls
          activity={activity}
          onEdit={() => {
            setEditMode(true);
            setEditForm({
              eventTitle: activity.eventTitle || "",
              eventDate: formatDate(activity.eventDate),
              votingDate: activity.votingDate
                ? formatDate(activity.votingDate)
                : "",
              location: activity.location || "",
              cost: activity.cost || "",
              description: activity.description || "",
              agenda: activity.agenda || "",
              whatToBring: activity.whatToBring?.join(", ") || "",
              whatsProvided: activity.whatsProvided?.join(", ") || "",
              contactInfo: activity.contactInfo || "",
            });
          }}
          onFinalize={handleFinalize}
          onCancel={handleCancelEvent}
          onDelete={handleDelete}
        />
      )}

      {/* USER STATUS BOX */}
      <UserStatusBox userEntry={userEntry} />

      {/* PARTICIPATION BUTTONS */}
      <ParticipationButtons
        activity={activity}
        isCreator={isCreator}
        showJoinButton={showJoinButton}
        isActivelyParticipating={isActivelyParticipating}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onStatusChange={handleStatusChange}
      />

      {/* AVAILABILITY EDITOR */}
      <AvailabilityEditor
        availability={availability}
        setAvailability={setAvailability}
        isActivelyParticipating={isActivelyParticipating}
        onSaveAvailability={handleAvailabilityUpdate}
      />

      {/* PARTICIPANTS LIST */}
      <div className="mt-4">
        <ParticipantsList activity={activity} />
      </div>
    </div>
  );
};

export default ActivityDetails;
