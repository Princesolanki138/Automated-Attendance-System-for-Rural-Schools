import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { useEffect, useState } from "react";
import AttendanceListModal from "../component/AttendanceListModal";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";

const PreviousClass = () => {
  const { userDetails } = useUserDetails();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lecturerId = userDetails?.lecturer_id;

  // Fetch classes
  const fetchClasses = async () => {
    if (!lecturerId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("lecturer_id", lecturerId);

    if (error) {
      toast.error(`Error fetching class data: ${error.message}`);
    } else {
      setClasses(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, [lecturerId]);

  const handleViewAttendance = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  return (
    <section className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center mb-8">
        <Link to="/classDetails">
          <button className="flex items-center gap-1 bg-[#000D46] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#001060] transition">
            <BiArrowBack size={18} />
            Back
          </button>
        </Link>

        <h2 className="text-center flex-1 text-2xl font-bold text-[#000D46]">
          List of Previous Classes
        </h2>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="loading loading-spinner text-[#000D46]" />
          </div>
        ) : classes.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-6 text-center font-semibold text-[#000D46] border-b border-gray-200 pb-3 mb-4 text-sm md:text-base">
              <span>S/N</span>
              <span>Course Code</span>
              <span>Course Title</span>
              <span>Date</span>
              <span>Time</span>
              <span>Attendance</span>
            </div>

            {/* Class Rows */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {classes.map((classItem, index) => {
                const formattedDate = new Date(
                  classItem.date
                ).toLocaleDateString();

                const formattedTime = new Date(
                  classItem.time
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={classItem.id}
                    className="grid grid-cols-6 text-center items-center bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm px-3 py-2 transition"
                  >
                    <span className="text-gray-800">{index + 1}</span>
                    <span className="text-gray-800">{classItem.course_code}</span>
                    <span className="text-gray-800">{classItem.course_title}</span>
                    <span className="text-gray-800">{formattedDate}</span>
                    <span className="text-gray-800">{formattedTime}</span>
                    <button
                      onClick={() => handleViewAttendance(classItem)}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-md shadow transition"
                    >
                      View List
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No previous classes found.
          </p>
        )}
      </div>

      {/* Attendance Modal */}
      <AttendanceListModal
        isOpen={isModalOpen}
        selectedClass={selectedClass}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default PreviousClass;
