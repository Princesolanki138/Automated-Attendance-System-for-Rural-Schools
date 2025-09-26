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
  const markerRef = useRef(null);

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            format: "json",
            lat: lat,
            lon: lng,
          },
        }
      );
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown location";
    } finally {
      setLoading(false);
    }
  };

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const handleClick = async (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition({ lat, lng });
        const name = await reverseGeocode(lat, lng);
        setLocationName(name);
        onSelectLocation(name, { lat, lng });

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Create a new marker with a permanent popup
        const marker = L.marker([lat, lng]).addTo(map);
        marker
          .bindPopup(`<div><p>${name}</p></div>`, { autoClose: false, closeOnClick: false })
          .openPopup();

        // Store the marker reference
        markerRef.current = marker;

        // Center the map on the new marker
        map.setView([lat, lng], map.getZoom());
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
      };
    }, [map]);

    return null;
  };

  // --- New: Use Current Location ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
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

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Add marker on map
        const map = markerRef.current?._map || null;
        if (map) {
          const marker = L.marker([lat, lng]).addTo(map);
          marker
            .bindPopup(`<div><p>${name}</p></div>`, { autoClose: false, closeOnClick: false })
            .openPopup();
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

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(locationName, selectedPosition);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-4/5 h-4/5 flex flex-col">
        <h2 className="sm:text-xl text-base text-neutral-700 font-bold mb-4 text-center">
          Select Location
        </h2>

        {/* --- Button for Current Location --- */}
        <div className="flex justify-end mb-2">
          <button
            className="btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
            onClick={handleUseCurrentLocation}
            disabled={loading}
          >
            Use Current Location
          </button>
        </div>

        <MapContainer
          center={[7.3056, 5.1357]}
          zoom={18}
          style={{ height: "70%", flex: 1 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
        </MapContainer>

        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="btn bg-red-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn bg-green-500 text-white px-4 py-2 rounded"
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
