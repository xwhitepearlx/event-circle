import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createActivity } from "../api/services/activities";
import ActivityForm from "../components/activityDetails/ActivityForm";

const CreateActivity = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "18:00",
    votingDate: "",
    votingTime: "",
    location: "",
    cost: "",
    description: "",
    agenda: "",
    whatToBring: "",
    whatsProvided: "",
    contactInfo: "",
    isFinalized: false,
  });

  // Helper to combine date and time into ISO string
  const combineDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    return new Date(`${dateStr}T${timeStr || "00:00"}`).toISOString();
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.eventTitle || !formData.eventDate || !formData.location) {
        alert(
          "Please fill in all required fields (Title, Event Date, Location)."
        );
        return;
      }

      // Combine event datetime
      const eventDateTime = combineDateTime(
        formData.eventDate,
        formData.eventTime
      );
      const now = new Date();

      // Validate event datetime is not in the past
      if (new Date(eventDateTime) < now) {
        alert(
          "Event date/time cannot be in the past. Please choose a future date/time."
        );
        return;
      }

      // Handle voting datetime
      let votingDateTime = null;
      if (formData.votingDate) {
        votingDateTime = combineDateTime(
          formData.votingDate,
          formData.votingTime
        );

        // Validate voting datetime is not after event datetime
        if (new Date(votingDateTime) > new Date(eventDateTime)) {
          alert("Voting deadline cannot be after the event date/time.");
          return;
        }

        // Validate voting datetime is not in the past
        if (new Date(votingDateTime) < now) {
          alert("Voting deadline cannot be in the past.");
          return;
        }
      }

      const payload = {
        eventTitle: formData.eventTitle,
        eventDate: eventDateTime,
        votingDate: votingDateTime,
        location: formData.location,
        cost: formData.cost,
        description: formData.description,
        agenda: formData.agenda,
        whatToBring: formData.whatToBring
          ? formData.whatToBring.split(",").map((x) => x.trim())
          : [],
        whatsProvided: formData.whatsProvided
          ? formData.whatsProvided.split(",").map((x) => x.trim())
          : [],
        contactInfo: formData.contactInfo,
        isFinalized: formData.isFinalized,
        createdBy: userId,
      };

      console.log("Final payload:", payload);

      const { status } = await createActivity(payload);

      if (status === 201 || status === 200) {
        navigate("/activities");
      }
    } catch (err) {
      console.error("Error creating activity:", err);
      alert(
        "Failed to create activity: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  // Handle checkbox toggle
  const handleFinalizeToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isFinalized: checked,
    }));
  };

  // Regular field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mt-4">
      <ActivityForm
        formData={formData}
        handleChange={handleChange}
        isFinalized={formData.isFinalized}
        onFinalizeToggle={handleFinalizeToggle}
        onSubmit={handleCreate}
        mode="create"
      />
    </div>
  );
};

export default CreateActivity;
