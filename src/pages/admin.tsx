// src/pages/admin.tsx

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute'; 

interface UploadResponse {
  message: string;
  // Add other fields based on your backend response
}

const Admin: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [targetDir, setTargetDir] = useState<string>('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      // Redirect to login if no token
      router.push('/');
    } else {
      setToken(savedToken);
    }
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();

    if (!targetDir || !zipFile) {
      setError('Please provide both target directory and ZIP file.');
      return;
    }

    // Read the file as Base64
    const reader = new FileReader();
    reader.readAsDataURL(zipFile);
    reader.onload = async () => {
      try {
        if (typeof reader.result === 'string') {
          // Extract Base64 string without the data URL prefix
          const base64String = reader.result.split(',')[1];

          const payload = {
            targetDir,
            zipFile: base64String,
          };

          const response = await axios.post<UploadResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/upload`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          setResponseMessage(JSON.stringify(response.data, null, 2));
          setError('');
        } else {
          setError('Failed to read the file. Please try again.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to upload the file. Please try again.');
        setResponseMessage('');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try a different file.');
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="targetDir" className="block mb-1 text-sm font-medium">
              Target Directory
            </label>
            <input
              id="targetDir"
              type="text"
              placeholder="e.g., uploads"
              value={targetDir}
              onChange={(e) => setTargetDir(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="zipFile" className="block mb-1 text-sm font-medium">
              ZIP File
            </label>
            <input
              id="zipFile"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Upload ZIP File
          </button>
        </form>

        {responseMessage && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">Response:</h3>
            <textarea
              readOnly
              value={responseMessage}
              className="w-full p-2 border rounded h-40 bg-gray-50 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectedRoute(Admin);
