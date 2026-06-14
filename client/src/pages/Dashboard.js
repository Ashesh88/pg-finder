import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'PG', gender: 'any',
    rent: '', deposit: '', furnishing: 'unfurnished',
    city: '', state: '', street: '', pincode: '',
    amenities: '',
  });

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/listings');
      const myListings = data.filter((l) => l.owner._id === user.id);
      setListings(myListings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async (listingId) => {
    try {
      const { data } = await API.get('/inquiries/listing/' + listingId);
      setInquiries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    setUploading(true);
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('images', file));
      const { data } = await API.post('/listings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.urls;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const imageUrls = await uploadImages();
      await API.post('/listings', {
        title: form.title,
        description: form.description,
        type: form.type,
        gender: form.gender,
        rent: Number(form.rent),
        deposit: Number(form.deposit),
        furnishing: form.furnishing,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
        images: imageUrls,
      });
      setShowForm(false);
      setImageFiles([]);
      setForm({ title: '', description: '', type: 'PG', gender: 'any', rent: '', deposit: '', furnishing: 'unfurnished', city: '', state: '', street: '', pincode: '', amenities: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await API.delete('/listings/' + id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          {user?.role === 'owner' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition text-sm"
            >
              {showForm ? 'Cancel' : '+ Add Listing'}
            </button>
          )}
        </div>

        {/* Add Listing Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-5">New Listing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="Spacious PG in Sector 62" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition resize-none"
                  rows={3} placeholder="Describe the property..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition bg-white">
                  <option value="PG">PG</option>
                  <option value="flat">Flat</option>
                  <option value="room">Room</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition bg-white">
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Rent (per month)</label>
                <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="8000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Deposit</label>
                <input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="16000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Furnishing</label>
                <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition bg-white">
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="Noida" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">State</label>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="Uttar Pradesh" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Street</label>
                <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="Block A, Sector 62" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Pincode</label>
                <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="201301" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Amenities (comma separated)</label>
                <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  placeholder="WiFi, AC, Meals, Laundry" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Images (max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                />
                {imageFiles.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{imageFiles.length} image(s) selected</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={uploading}
              className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm disabled:opacity-50"
            >
              {uploading ? 'Uploading images...' : 'Create Listing'}
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings.length },
            { label: 'Available', value: listings.filter((l) => l.isAvailable).length },
            { label: 'Total Inquiries', value: inquiries.length },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">My Listings</h2>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No listings yet. Add your first listing.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Title</th>
                  <th className="text-left px-5 py-3">City</th>
                  <th className="text-left px-5 py-3">Rent</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">{listing.title}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{listing.address?.city}</td>
                    <td className="px-5 py-4 text-sm text-blue-600 font-medium">Rs {listing.rent?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{listing.type}</td>
                    <td className="px-5 py-4">
                      <span className={"text-xs font-medium px-3 py-1 rounded-full " + (listing.isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
                        {listing.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-5 py-4 flex gap-2">
                      <button
                        onClick={() => { fetchInquiries(listing._id); setActiveTab('inquiries'); }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Inquiries
                      </button>
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inquiries */}
        {inquiries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Inquiries</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {inquiries.map((inq) => (
                <div key={inq._id} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{inq.tenant?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{inq.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{inq.tenant?.email} · {inq.tenant?.phone}</p>
                    </div>
                    <span className={"text-xs font-medium px-3 py-1 rounded-full " + (
                      inq.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      inq.status === 'responded' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-500'
                    )}>
                      {inq.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;