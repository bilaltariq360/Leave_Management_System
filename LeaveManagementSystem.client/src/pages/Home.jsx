import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Send,
  User,
  Mail,
  Calendar,
  Hash,
  MessageSquare,
  Wand2,
  XCircle,
  Sparkles,
  Pencil,
  X,
} from "lucide-react"; // Added Wand2 icon for AI generation

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    reason: "",
    status: "pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [shortReason, setShortReason] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5003/api/Employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "pending" }),
      });

      if (response.ok) {
        setMessage("Leave request submitted successfully!");
        setFormData({ name: "", id: "", email: "", reason: "" });
      } else if (response.status === 409) {
        setMessage(`${await response.text()}`);
      }
    } catch (error) {
      setMessage("Error submitting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateReason = async () => {
    if (!shortReason.trim()) return;
    setLoadingAI(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5003/api/Employees/generate-response",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: shortReason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFormData((prev) => ({ ...prev, reason: data.generatedReason }));
        setShowModal(false);
        setShortReason("");
      } else {
        alert(data || "Failed to generate reason. Please try again.");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LeaveFlow</span>
            </div>
            <Link
              to="/admin"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Leave Request
          </h1>
          <p className="text-lg text-gray-600">
            Fill out the form below to request time off
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Employee ID"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
                Reason for Leave
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 text-sm flex items-center hover:underline"
                >
                  <Wand2 className="h-4 w-4 mr-1" />
                  Generate with AI
                </button>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please provide the reason for your leave request..."
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-gray-800 to-blue-800 text-white py-3 px-6 rounded-lg font-semibold hover:scale-105 focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white relative p-6 rounded-2xl shadow-2xl border border-gray-200 w-[22rem] space-y-5 transform scale-95 animate-slideUp">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              <h2 className="text-xl font-bold text-gray-800">
                AI Leave Reason Generator
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              Type a short reason, and let AI craft a professional leave request
              for you.
            </p>

            {/* Input */}
            <div className="relative">
              <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="E.g., feeling unwell..."
                value={shortReason}
                onChange={(e) => setShortReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center space-x-1 transition-all"
              >
                <XCircle className="h-4 w-4" />
                <span>Cancel</span>
              </button>

              <button
                onClick={generateReason}
                disabled={loadingAI}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 flex items-center space-x-1 transition-all disabled:opacity-50"
              >
                {loadingAI ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
