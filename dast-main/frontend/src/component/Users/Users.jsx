import React, { useState, useEffect } from "react";
import axios from "axios";
import Cards from "./Cards";

const Users = () => {
  const [query, setQuery] = useState("");
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.dastakappecitizenkp.com/weapons"
        );
        setAllData(response.data);
        setFilteredData(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        setIsLoading(false);
        console.error("API Error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!query.trim()) {
        setFilteredData(allData);
        return;
      }
      const searchTerm = query.toLowerCase();
      const filtered = allData.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(searchTerm)) ||
          (item.fname && item.fname.toLowerCase().includes(searchTerm)) ||
          (item.cnic && item.cnic.toLowerCase().includes(searchTerm))
      );
      setFilteredData(filtered);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, allData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError("");
    try {
      const response = await axios.put(
        `https://api.dastakappecitizenkp.com/weapons/${selectedItem._id}`,
        selectedItem
      );
      const updatedItem = response.data;
      const newData = allData.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      );
      setAllData(newData);
      setFilteredData(newData);
      setSelectedItem(null);
    } catch (err) {
      setUpdateError("Failed to update record. Please try again.");
      console.error("Update error:", err);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedItem || !selectedItem._id) {
      setUpdateError("Invalid record selected.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://api.dastakappecitizenkp.com/weapons/${selectedItem._id}`
      );

      // Update the state after deletion
      const newData = allData.filter((item) => item._id !== selectedItem._id);
      setAllData(newData);
      setFilteredData(newData);
      setSelectedItem(null);
    } catch (err) {
      setUpdateError("Failed to delete record. Please try again.");
      console.error("Delete error:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  const EditModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={() => setSelectedItem(null)}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Record</h2>
        {updateError && <div className="text-red-500 text-sm mb-4">{updateError}</div>}
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" value={selectedItem.name || ""} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="Name"/>
            <input type="text" name="fname" value={selectedItem.fname || ""} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="Father's Name"/>
            <input type="text" name="cnic" value={selectedItem.cnic || ""} onChange={handleInputChange} className="w-full p-2 border rounded-md" placeholder="CNIC"/>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Changes</button>
            <button type="button" onClick={handleDeleteSubmit} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="h-12 w-12 animate-spin border-4 border-blue-500 border-t-transparent rounded-full"/></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-full overflow-scroll">
      <div className="flex items-center justify-center p-4">
        <input type="text" placeholder="Search by name, CNIC..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full max-w-2xl rounded-lg border p-2"/>
      </div>

      <div className="grid h-full grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredData.map((item) => (
          <Cards
            key={item._id}
            onEdit={() => setSelectedItem({ ...item })}
            onDelete={() => { setSelectedItem(item); handleDeleteSubmit(); }}
            img={item.image}
            name={item.name}
            fname={item.fname}
            cnic={item.cnic}
            address={item.address}
            license={item.license}
            weapon={item.weapon}
            cartidges={item.cartidges}
            qrcode={item.qrCodeDataUrl}
            issue={item.issue}
            valid={item.valid}
          />
        ))}
      </div>

      {!isLoading && filteredData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {query ? "No matching records found" : "No records available"}
        </div>
      )}

      {selectedItem && <EditModal />}
    </div>
  );
};

export default Users;
