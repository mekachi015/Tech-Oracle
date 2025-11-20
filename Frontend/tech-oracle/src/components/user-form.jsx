"use client";
import React, { useState } from "react";
import Stepper from "./user-form-stepper";

const InputField = ({ label, name, value, onChange, type = "text", required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 3, required }) => (
  <div className="col-span-1 md:col-span-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      rows={rows}
      required={required}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      required={required}
      onChange={onChange}
      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600"
    >
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const UserForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [repairGuide, setRepairGuide] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    address: "",
    deviceBrand: "",
    deviceModel: "",
    deviceType: "",
    modelNumber: "",
    serialNumber: "",
    deviceIssue: "",
    operatingSystem: "",
    ram: "",
    storage: "",
    processor: "",
    graphicsCard: "",
    additionalInfo: "",
    files: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      files: [...e.target.files],
    }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // ------------------ STEP RENDERERS ------------------------
  const renderUserDetails = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
        <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
        <InputField type="email" label="Email Address" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} required />
        <TextAreaField label="Address" name="address" value={formData.address} onChange={handleInputChange} required rows={2} />
      </div>
    </div>
  );

  const renderDeviceInfo = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Device Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Device Brand"
          name="deviceBrand"
          value={formData.deviceBrand}
          onChange={handleInputChange}
          required
          options={["Apple", "Samsung", "Dell", "HP", "Lenovo"]}
        />

        <SelectField
          label="Device Type"
          name="deviceType"
          value={formData.deviceType}
          onChange={handleInputChange}
          options={["Smartphone", "Laptop", "Desktop", "Tablet", "Gaming Console"]}
          required
        />

        <InputField label="Device Model" name="deviceModel" value={formData.deviceModel} onChange={handleInputChange} required />

        <InputField label="Model Number / SKU" name="modelNumber" value={formData.modelNumber} onChange={handleInputChange} />

        <TextAreaField
          label="Describe the Problem"
          name="deviceIssue"
          rows={4}
          required
          value={formData.deviceIssue}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );

  const renderTechSpecs = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Technical Specifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Operating System"
          name="operatingSystem"
          value={formData.operatingSystem}
          onChange={handleInputChange}
          options={["Windows 11", "macOS Ventura", "Android 13", "iOS 16"]}
        />

        <SelectField
          label="RAM"
          name="ram"
          value={formData.ram}
          onChange={handleInputChange}
          options={["4GB", "8GB", "16GB", "32GB", "Unknown"]}
        />

        <SelectField
          label="Storage"
          name="storage"
          value={formData.storage}
          onChange={handleInputChange}
          options={["64GB", "128GB", "256GB", "512GB", "1TB", "Unknown"]}
        />

        <InputField label="Graphics Card" name="graphicsCard" value={formData.graphicsCard} onChange={handleInputChange} />

        <InputField label="Processor" name="processor" value={formData.processor} onChange={handleInputChange} />

        <InputField label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} />
      </div>
    </div>
  );

  const renderFileUpload = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upload Images or Videos</h2>
      <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Upload files of the device issue (images or videos)</p>

          <label className="mt-2 cursor-pointer text-blue-600 hover:text-blue-700">
            <span>Choose Files</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );

  const stepContent = {
    1: renderUserDetails(),
    2: renderDeviceInfo(),
    3: renderTechSpecs(),
    4: renderFileUpload(),
  };

  // ------------------ SUBMIT HANDLER ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < 4) return nextStep();

    setLoading(true);
    setError("");
    setRepairGuide("");

    try {
      const payload = {
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        deviceModelNumber: formData.modelNumber,
        deviceIssue: formData.deviceIssue,
        additionalInfo: formData.additionalInfo,
        operatingSystem: formData.operatingSystem,
        ram: formData.ram,
        storage: formData.storage,
        processor: formData.processor,
        graphicsCard: formData.graphicsCard,
        serialNumber: formData.serialNumber,
      };

      const response = await fetch("http://localhost:8000/add_repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

     if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Submission failed: ${errorData.detail || 'Unknown Error'}`);
      }

      const data = await response.json();
      setRepairGuide(`✅ Request submitted successfully! Record ID: ${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-8">
        <Stepper currentStep={currentStep} />

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {stepContent[currentStep]}

          <div className="pt-6 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-md border shadow text-gray-700 hover:bg-gray-100"
              >
                Previous
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading
                ? "Generating..."
                : currentStep === 4
                ? "Submit"
                : "Next"}
            </button>
          </div>
        </form>

        {/* Output */}
        {loading && <p className="mt-4 text-blue-600 text-center">Generating repair guide...</p>}
        {error && <p className="mt-4 text-red-600 text-center">Error: {error}</p>}

        {repairGuide && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-xl font-bold mb-2">Generated Repair Guide</h3>
            <pre className="whitespace-pre-wrap text-gray-800">{repairGuide}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;
