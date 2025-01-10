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
    <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar</label>
          <input
            type="file"
            id="avatar"
            onChange={handleAvatarChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {avatar && <p className="text-gray-600 text-sm mt-2">{avatar.name}</p>}
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default App;
