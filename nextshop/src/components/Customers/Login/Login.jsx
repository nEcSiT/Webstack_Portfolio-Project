import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import '../../../App.css';  // Import the CSS file

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [avatar, setAvatar] = useState(null);

  // Convert file to base64 format
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      avatar: avatar || null, // Send avatar as base64 string
    };

    // Sending data to the backend
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/user/create-user", // Backend URL from environment variable
        payload,
        {
          headers: {
            'Content-Type': 'application/json', // Sending JSON data
          },
        }
      );
      console.log('Success:', response.data); // Handle response if needed
    } catch (error) {
      console.error('Error:', error.response || error.message); // Handle error if needed
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
          <input
            type="file"
            id="avatar"
            onChange={handleAvatarChange}
          />
          {avatar && (
            <div className="avatar-preview">
              <img src={avatar} alt="Avatar preview" />
            </div>
          )}
        </div>

        <button type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Login;
