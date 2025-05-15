import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, storage } from "../firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "../css/SearchBar.css";

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (searchTerm.trim().length > 1) {
            searchUsers(searchTerm);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    }, [searchTerm]);

    const searchUsers = async (queryText) => {
        try {
            const usersRef = collection(db, "therapists");
            const q = query(
                usersRef,
                where("verified", "==", true),
                where("firstName", ">=", queryText),
                where("firstName", "<=", queryText + "\uf8ff")
            );
            const snapshot = await getDocs(q);

            const results = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = { id: doc.id, ...doc.data() };
                try {
                    const imgRef = ref(storage, `therapists/${doc.id}/profile`);
                    data.photoURL = await getDownloadURL(imgRef);
                } catch {
                    data.photoURL = null;
                }
                return data;
            }));

            setSearchResults(results);
            setShowDropdown(results.length > 0);
        } catch (err) {
            console.error("Search error:", err);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSearchTerm("");
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="searchbar-wrapper">
            <div className="searchbar-input-wrapper">
                <input
                    type="text"
                    placeholder="Search therapists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <AiOutlineSearch className="search-icon" />
            </div>

            {showDropdown && (
                <div ref={dropdownRef} className="search-dropdown">
                    {searchResults.map((user) => (
                        <div
                            key={user.id}
                            className="search-item"
                            onClick={() => navigate(`/account/${user.id}`)}
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="search-avatar" />
                            ) : (
                                <div className="search-initials">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                            )}
                            <div className="search-info">
                                <div className="search-name">{user.firstName} {user.lastName}</div>
                                <div className="search-specialty">{user.specialties}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
