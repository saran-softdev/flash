"use client";
import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function CreateGroup() {
  const [terms, setTerms] = useState([
    { id: 1, term: "", definition: "", image: null }
  ]);
  const [groupImage, setGroupImage] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState(null);

  // Convert image file to base64 format
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
      } catch (error) {
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, []);

  const handleAddMore = () => {
    setTerms([
      ...terms,
      { id: terms.length + 1, term: "", definition: "", image: null }
    ]);
  };

  const handleGroupImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      setGroupImage(base64Image);
    }
  };

  const handleTermImageUpload = async (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await toBase64(file);
      const updatedTerms = [...terms];
      updatedTerms[index].image = base64Image;
      setTerms(updatedTerms);
    }
  };

  const handleDeleteTerm = (index) => {
    const updatedTerms = terms.filter((_, termIndex) => termIndex !== index);
    setTerms(updatedTerms);
  };

  const handleCreateGroup = async () => {
    try {
      const groupData = {
        name: groupName,
        description,
        groupImage,
        terms,
        userId
      };

      const response = await axios.post(
        "/api/createNew?controllerName=createNew",
        groupData
      );
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to create group");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7e8d7] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="font-semibold text-lg">Create Group *</label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter Group Name"
              className="flex-1 px-4 py-2 border rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="px-4 py-2 border border-indigo-500 text-indigo-500 rounded-md flex items-center justify-center space-x-2 hover:bg-indigo-50 focus:outline-none cursor-pointer">
              <FiUpload className="h-5 w-5" />
              <span>Upload Image</span>
              <input
                type="file"
                onChange={handleGroupImageUpload}
                className="hidden"
              />
            </label>
          </div>
          {groupImage && (
            <div className="mt-2">
              <img
                src={groupImage}
                alt="Group Preview"
                className="h-20 w-20 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label className="font-semibold text-lg">Add Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Group Description"
            className="px-4 py-2 border rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          ></textarea>
        </div>

        <div className="space-y-4">
          {terms.map((term, index) => (
            <div
              key={term.id}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 items-start sm:items-center bg-[#f8f4f0] p-4 rounded-md shadow-sm"
            >
              <div className="flex items-center justify-center h-8 w-8 bg-red-500 text-white font-bold rounded-full">
                {index + 1}
              </div>
              <div className="flex-1 flex flex-col space-y-1 mt-2 sm:mt-0 sm:ml-4">
                <label className="font-semibold">Enter Term</label>
                <input
                  type="text"
                  value={term.term}
                  onChange={(e) => {
                    const updatedTerms = [...terms];
                    updatedTerms[index].term = e.target.value;
                    setTerms(updatedTerms);
                  }}
                  placeholder="Enter Terms"
                  className="px-4 py-2 border rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1 flex flex-col space-y-1 mt-2 sm:mt-0 sm:ml-4">
                <label className="font-semibold">Enter Definition</label>
                <textarea
                  value={term.definition}
                  onChange={(e) => {
                    const updatedTerms = [...terms];
                    updatedTerms[index].definition = e.target.value;
                    setTerms(updatedTerms);
                  }}
                  placeholder="Enter Definition"
                  className="px-4 py-2 border rounded-md text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                ></textarea>
              </div>

              <label className="mt-2 sm:mt-0 sm:ml-4 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 focus:outline-none cursor-pointer">
                + Select Image
                <input
                  type="file"
                  onChange={(event) => handleTermImageUpload(index, event)}
                  className="hidden"
                />
              </label>

              {term.image && (
                <img
                  src={term.image}
                  alt={`Term ${index + 1} Preview`}
                  className="h-16 w-16 object-cover rounded-md mt-2 sm:mt-0 sm:ml-4"
                />
              )}

              <button
                className="text-gray-500 hover:text-red-500 focus:outline-none mt-2 sm:mt-0 sm:ml-4"
                onClick={() => handleDeleteTerm(index)}
              >
                <FiTrash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddMore}
            className="text-blue-500 hover:text-blue-600 focus:outline-none flex items-center space-x-2"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add More</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleCreateGroup}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
