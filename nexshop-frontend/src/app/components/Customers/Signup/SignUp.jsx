"use client";
import React, { useState } from "react";
import axios from "axios";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar") {
      setFormData({
        ...formData,
        avatar: files[0], // Store the selected file
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({
          ...prevState,
          avatar: reader.result, // Set the Base64 data of the file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, avatar } = formData;

    if (!avatar) {
      alert("Please select an avatar file.");
      return;
    }

    const dataToSend = {
      name,
      email,
      password,
      avatar, // This is the Base64 string
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/user/create-user`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json", // Send as JSON
          },
        }
      );

      if (response.status === 201) {
        console.log("Response data:", response.data);
        setFormData({
          name: "",
          email: "",
          password: "",
          avatar: null,
        });
        alert("User created successfully!");
      } else {
        console.log("Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error during form submission:", error.response ? error.response.data : error.message);
      alert("There was an error submitting the form.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="avatar">Avatar:</label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          onChange={handleFileChange}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default SignUpForm;
