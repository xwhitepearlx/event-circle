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
    votingDate: "",
    location: "",
    cost: "",
    description: "",
    agenda: "",
    whatToBring: "",
    whatsProvided: "",
    contactInfo: ""
  });

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        whatToBring: formData.whatToBring
          ? formData.whatToBring.split(",").map((x) => x.trim())
          : [],
        whatsProvided: formData.whatsProvided
          ? formData.whatsProvided.split(",").map((x) => x.trim())
          : [],
        createdBy: userId,
      };

      const { status } = await createActivity(payload);

      if (status === 201 || status === 200) {
        navigate("/activities");
      }
    } catch (err) {
      console.error("Error creating activity:", err);
    }
  };

  return (
    <div className="container mt-4">
      <ActivityForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CreateActivity;
