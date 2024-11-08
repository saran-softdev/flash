"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Correct import for jwtDecode
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const UserFlashcards = () => {
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null); // New state to track the selected group
  const printRef = useRef();

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
        setSelectedGroup(response.data.groups[0]._id); // Set default selected group
      }
    } catch (error) {
      console.error("Error fetching groups", error);
    }
  };

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value); // Update selected group based on dropdown selection
  };

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (selectedGroupData) {
      for (const term of selectedGroupData.terms) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(term.term, pageWidth / 2, 20, { align: "center" });

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        const margin = 20;
        const maxTextWidth = pageWidth - margin * 2;
        const lineHeight = 10;
        let currentHeight = 30;

        const textLines = pdf.splitTextToSize(term.definition, maxTextWidth);
        for (const line of textLines) {
          if (currentHeight + lineHeight > pageHeight - 60) {
            pdf.addPage();
            currentHeight = 20;
          }
          pdf.text(line, margin, currentHeight);
          currentHeight += lineHeight;
        }

        if (term.image && term.image[0]?.url) {
          const imgData = await fetch(term.image[0].url)
            .then((res) => res.blob())
            .then(
              (blob) =>
                new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsDataURL(blob);
                })
            );

          if (currentHeight + 70 > pageHeight - 20) {
            pdf.addPage();
            currentHeight = 20;
          }

          pdf.addImage(
            imgData,
            "JPEG",
            margin,
            currentHeight,
            maxTextWidth,
            70
          );
          currentHeight += 80;
        }

        if (
          term !== selectedGroupData.terms[selectedGroupData.terms.length - 1]
        ) {
          pdf.addPage();
        }
      }
    }

    pdf.save("flashcards.pdf");
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
        </div>

        <div
          className="w-full sm:w-1/2 flex flex-col items-center"
          ref={printRef}
        >
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

              {selectedGroupData.terms.map((term, index) => (
                <div
                  key={index}
                  className="border rounded-lg shadow-md p-4 text-center mb-4 sm:mb-6"
                >
                  {term.image && term.image[0]?.url && (
                    <img
                      src={term.image[0].url}
                      alt={term.term}
                      className="w-24 sm:w-32 h-24 sm:h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="text-md sm:text-lg font-medium text-gray-800 mb-2">
                    {term.term}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base max-h-24 overflow-y-auto break-words px-2">
                    {term.definition}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No flashcards found</p>
          )}
        </div>

        <div className="w-full sm:w-1/4 flex flex-col gap-4 items-center">
          <button
            onClick={handleDownloadPdf}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFlashcards;
