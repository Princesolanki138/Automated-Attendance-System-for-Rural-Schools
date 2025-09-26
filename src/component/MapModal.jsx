/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import toast from "react-hot-toast";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapModal = ({ onClose, onSelectLocation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const markerRef = useRef(null);
  const mapRef = useRef(null); // store map instance

  // Reverse Geocoding
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          format: "json",
          lat,
          lon: lng,
        },
      });
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown location";
    }
  };

  // Map Events
  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      mapRef.current = map;

      const handleClick = async (e) => {
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        setSelectedPosition({ lat, lng });
        setLocationName(name);
        onSelectLocation(name, { lat, lng });

        // Remove old marker
        if (markerRef.current) markerRef.current.remove();

        // Add new marker
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<div><p>${name}</p></div>`).openPopup();

        markerRef.current = marker;
        map.setView([lat, lng], 18);
      };

      map.on("click", handleClick);
      return () => map.off("click", handleClick);
    }, [map]);

    return null;
  };

  // Use Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const name = await reverseGeocode(lat, lng);

        setSelectedPosition({ lat, lng });
        setLocationName(name);
        onSelectLocation(name, { lat, lng });

        // Remove old marker
        if (markerRef.current) markerRef.current.remove();

        const map = mapRef.current;
        if (map) {
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(`<div><p>${name}</p></div>`).openPopup();

          markerRef.current = marker;
          map.setView([lat, lng], 18);
        }

        toast.success("Current location selected!");
        setLoading(false);
      },
      (error) => {
        toast.error(`Error fetching location: ${error.message}`);
        setLoading(false);
      }
    );
  };

  // 🔎 Search Location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          format: "json",
          q: searchQuery,
        },
      });

      if (response.data.length === 0) {
        toast.error("No results found.");
        setLoading(false);
        return;
      }

      const { lat, lon, display_name } = response.data[0];

      setSelectedPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setLocationName(display_name);
      onSelectLocation(display_name, { lat: parseFloat(lat), lng: parseFloat(lon) });

      // Remove old marker
      if (markerRef.current) markerRef.current.remove();

      const map = mapRef.current;
      if (map) {
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<div><p>${display_name}</p></div>`).openPopup();

        markerRef.current = marker;
        map.setView([lat, lon], 18);
      }

      toast.success("Location found!");
    } catch (error) {
      toast.error("Error searching location.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(locationName, selectedPosition);
      onClose();
    } else {
      toast.error("Please select a location.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-4/5 h-4/5 flex flex-col">
        <h2 className="sm:text-xl text-base text-neutral-700 font-bold mb-4 text-center">
          Select Location
        </h2>

        {/* 🔎 Search and Current Location */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Search for a place..."
            className="border border-gray-300 px-3 py-1 rounded flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Search
          </button>
          <button
            onClick={handleUseCurrentLocation}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            disabled={loading}
          >
            Current
          </button>
        </div>

        {/* Map */}
        <MapContainer
          center={[7.3056, 5.1357]}
          zoom={18}
          style={{ height: "70%", flex: 1 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
        </MapContainer>

        {/* Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading || !selectedPosition}
          >
            {loading ? "Loading..." : "Confirm Location"}
          </button>
        </div>

        {selectedPosition && (
          <p className="my-2 text-neutral-800 sm:text-base text-sm">
            <b>Selected: </b>
            {locationName}
          </p>
        )}
      </div>
    </div>
  );
};

export default MapModal;
