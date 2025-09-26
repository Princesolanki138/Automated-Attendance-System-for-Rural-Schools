import { useState } from "react";
import Input from "../component/Input";
import MapModal from "../component/MapModal";
import QRCodeModal from "../component/QRCodeModal";
import scheduleImg from "../../public/scheduleImg.jpg";
import logo from "../../public/trackAS.png";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const VERCEL_URL = import.meta.env.VITE_VERCEL_URL || "http://localhost:5173";

const ClassSchedule = () => {
  const { userDetails } = useUserDetails();

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    lectureVenue: "",
    time: "",
    date: "",
    note: "",
  });

  const [selectedLocationCordinate, setSelectedLocationCordinate] = useState(null);
  const [qrData, setQrData] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (locationName, coordinate) => {
    setFormData({ ...formData, lectureVenue: locationName });
    setSelectedLocationCordinate(coordinate);
  };

  const lecturerId = userDetails?.lecturer_id;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let locationGeography = null;
    if (selectedLocationCordinate) {
      locationGeography = `SRID=4326;POINT(${selectedLocationCordinate.lng} ${selectedLocationCordinate.lat})`;
    }

    const { courseTitle, courseCode, lectureVenue, time, date, note } = formData;

    const registrationLink = `${VERCEL_URL}/studentLogin?courseCode=${encodeURIComponent(
      courseCode
    )}&time=${encodeURIComponent(time)}&lectureVenue=${encodeURIComponent(
      lectureVenue
    )}&lat=${selectedLocationCordinate?.lat}&lng=${selectedLocationCordinate?.lng}`;

    const qrCodeDataUrl = await new Promise((resolve) => {
      const svg = document.createElement("div");
      const qrCode = <QRCodeSVG value={registrationLink} size={256} />;
      import("react-dom/client").then((ReactDOM) => {
        ReactDOM.createRoot(svg).render(qrCode);
        setTimeout(() => {
          const svgString = new XMLSerializer().serializeToString(svg.querySelector("svg"));
          const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
          resolve(dataUrl);
        }, 0);
      });
    });

    const { data, error } = await supabase
      .from("classes")
      .insert([
        {
          course_title: courseTitle,
          course_code: courseCode,
          time: new Date(`${date}T${time}`).toISOString(),
          date: new Date(date).toISOString(),
          location: locationGeography,
          note: note,
          qr_code: qrCodeDataUrl,
          lecturer_id: lecturerId,
          location_name: lectureVenue,
        },
      ])
      .select("course_id");

    if (error) {
      toast.error(`Error inserting class schedule data, ${error.message}`);
      console.error("Error inserting data:", error);
    } else {
      toast.success("Class schedule created successfully");

      const generatedCourseId = data[0]?.course_id;
      const updatedRegistrationLink = `${VERCEL_URL}/attendance?courseId=${encodeURIComponent(
        generatedCourseId
      )}&time=${encodeURIComponent(time)}&courseCode=${encodeURIComponent(
        courseCode
      )}&lat=${selectedLocationCordinate?.lat}&lng=${selectedLocationCordinate?.lng}`;

      setQrData(updatedRegistrationLink);
      setIsQRModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-h-[100vh] bg-gray-100">
      {/* Left Form Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
            <Link to="/classDetails">
              <button className="btn btn-sm bg-blue-500 text-white rounded-full">
                Back
              </button>
            </Link>
            <img src={logo} alt="logo" className="w-24" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Course Title"
              name="courseTitle"
              type="text"
              onChange={handleInputChange}
              value={formData.courseTitle}
              required
            />
            <Input
              label="Course Code"
              name="courseCode"
              type="text"
              onChange={handleInputChange}
              value={formData.courseCode}
              required
            />
            <div className="relative">
              <Input
                label="Lecture Venue"
                name="lectureVenue"
                type="text"
                placeholder="Select location"
                value={formData.lectureVenue}
                readOnly
                required
              />
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="btn absolute right-0 top-9 px-3 bg-green-500 text-white rounded-r-md"
              >
                Select
              </button>
            </div>
            <Input
              name="time"
              type="time"
              label="Time"
              onChange={handleInputChange}
              value={formData.time}
              required
            />
            <Input
              name="date"
              type="date"
              label="Date"
              onChange={handleInputChange}
              value={formData.date}
              required
            />
            <Input
              label="Note"
              name="note"
              type="text"
              onChange={handleInputChange}
              value={formData.note}
            />
            <button type="submit" className="w-full btn bg-blue-500 text-white">
              Generate QR Code
            </button>
          </form>
        </div>
      </div>

      {/* Right Image */}
      <div className="hidden md:flex w-1/2 h-screen overflow-hidden">
        <img
          src={`https://images.hindustantimes.com/rf/image_size_630x354/HT/p2/2019/10/03/Pictures/empty-classroom-seen-in-srinagar_63e42d3e-e607-11e9-939f-ba4a7f73df5c.jpg`}
          alt="Student"
          className="object-cover w-full h-full opacity-30"
        />
      </div>

      {isMapModalOpen && (
        <MapModal
          onClose={() => setIsMapModalOpen(false)}
          onSelectLocation={handleLocationChange}
        />
      )}

      {isQRModalOpen && (
        <QRCodeModal
          qrData={qrData}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClassSchedule;
