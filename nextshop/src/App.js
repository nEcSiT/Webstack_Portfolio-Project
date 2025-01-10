import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function App() {
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
    <div className="max-w-md mx-auto p-6 bg-white border border-gray-300 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
          <input
            type="file"
            id="avatar"
            onChange={handleAvatarChange}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {avatar && (
            <div className="mt-2">
              <img
                src={avatar}
                alt="Avatar preview"
                className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white text-lg rounded-md hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default App;
