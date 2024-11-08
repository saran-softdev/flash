"use client"
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserFlashcards = () => {
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserGroups(userId);
    }
  }, [userId]);

  const fetchUserGroups = async (userId) => {
    try {
      const response = await axios.get(
        `/api/createNew?controllerName=getMyFlashCard&userId=${userId}`
      );
      setGroups(response.data.groups);
      if (response.data.groups.length > 0) {
        setSelectedGroup(response.data.groups[0]._id);
      }
    } catch (error) {
      console.error("Error fetching groups", error);
    }
  };

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(
        `/api/createNew?controllerName=deleteFlashCardGroup&groupId=${groupId}`
      );
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
      if (selectedGroup === groupId) setSelectedGroup(null); // Reset selection if deleted group is selected
    } catch (error) {
      console.error("Error deleting group", error);
    }
  };

  const selectedGroupData = groups.find((group) => group._id === selectedGroup);

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-5xl mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Create Flashcard
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row w-full max-w-5xl bg-white rounded-lg shadow-lg p-4 sm:p-6 gap-4 sm:gap-6">
        <div className="w-full sm:w-1/4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-4">
            Flashcards
          </h2>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleGroupChange}
            value={selectedGroup || ""}
          >
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex items-center justify-between mt-2"
            >
              <span>{group.name}</span>
              <button
                onClick={() => handleDeleteGroup(group._id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col items-center">
          {selectedGroupData ? (
            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-700">
                {selectedGroupData.name}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-4 max-h-20 overflow-y-auto break-words">
                {selectedGroupData.description}
              </p>
              {selectedGroupData.groupImage && (
                <img
                  src={selectedGroupData.groupImage.url}
                  alt={selectedGroupData.name}
                  className="w-full h-40 sm:h-48 object-cover rounded mb-4 sm:mb-6 shadow-sm"
                />
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">No flashcards found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserFlashcards;
