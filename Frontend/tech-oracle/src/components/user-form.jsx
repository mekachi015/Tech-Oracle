"use client"
import React, { useState } from 'react';
import Stepper from './user-form-stepper';
import { set } from 'zod';

const UserForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // User details
        fullName: '',
        phoneNumber: '',
        emailAddress: '',
        address: '',
        // Device Information
        deviceBrand: '',
        deviceModel: '',
        deviceType: '',
        modelNumber: '',
        serialNumber: '',
        deviceIssue: '',
        // Technical Specs
        operatingSystem: '',
        ram: '',
        storage: '',
        processor: '',
        graphicsCard: '',
        // Additional Info
        additionalInfo: '',
        files: [],
    });

    const [repairGuide, setRepairGuide] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            files: [...e.target.files]
        }));
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const renderUserDetails = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
            </div>
        </div>
    );

    const renderDeviceInfo = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Device Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Brand</label>
                    <select
                        name="deviceBrand"
                        value={formData.deviceBrand}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Brand</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Dell">Dell</option>
                        <option value="HP">HP</option>
                        <option value="Lenovo">Lenovo</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Type</label>
                    <select
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Gaming Console">Gaming Console</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Model</label>
                    <input
                        type="text"
                        name="deviceModel"
                        value={formData.deviceModel}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Model Number/SKU</label>
                    <input
                        type="text"
                        name="modelNumber"
                        value={formData.modelNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                    Device Issues/Problems
                </label>
                <textarea
                    name="deviceIssue"
                    value={formData.deviceIssue}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Please describe the problems you are experiencing with your device..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                />
                <p className="mt-2 text-sm text-gray-500">
                    Be as specific as possible about the issues you're experiencing. Include when the problem started and any error messages you've seen.
                </p>
            </div>
            </div>
        </div>
    );

    const renderTechSpecs = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Operating System</label>
                    <select
                        name="operatingSystem"
                        value={formData.operatingSystem}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select OS</option>
                        <option value="Windows 11">Windows 11</option>
                        <option value="macOS Ventura">macOS Ventura</option>
                        <option value="Android 13">Android 13</option>
                        <option value="iOS 16">iOS 16</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">RAM/Memory</label>
                    <select
                        name="ram"
                        value={formData.ram}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select RAM</option>
                        <option value="4GB">4GB</option>
                        <option value="8GB">8GB</option>
                        <option value="16GB">16GB</option>
                        <option value="32GB">32GB</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Storage</label>
                    <select
                        name="storage"
                        value={formData.storage}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Select Storage</option>
                        <option value="64GB">64GB</option>
                        <option value="128GB">128GB</option>
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                        <option value="Unknown">Unknown</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Graphics Card</label>
                    <input
                        type="text"
                        name="graphicsCard"
                        value={formData.graphicsCard}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );

    const renderFileUpload = () => (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                    >
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                            <span>Upload files</span>
                            <input
                                id="file-upload"
                                name="files"
                                type="file"
                                className="sr-only"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                    </p>
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderUserDetails();
            case 2:
                return renderDeviceInfo();
            case 3:
                return renderTechSpecs();
            case 4:
                return renderFileUpload();
            default:
                return null;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentStep < 4) {
            nextStep();
        } else {
            // Handle final form submission
            console.log('Form submitted:', formData);
            setLoading(true);
            setError('');
            setRepairGuide('');

            try{
                const payload = {
                    deviceBrand: formData.deviceBrand,
                    deviceModel: formData.deviceModel,
                    deviceModelNumber: formData.moded, // Map frontend modelNumber to backend deviceModelNumber
                    deviceIssue: formData.deviceIssue,
                    additionalInfo: formData.additionalInfo,
                    operatingSystem: formData.operatingSystem,
                    ram: formData.ram,
                    storage: formData.storage,
                    processor: formData.processor,
                    graphicsCard: formData.graphicsCard,
                    serialNumber: formData.serialNumber,
                }

                const response = await fetch('http://localhost:8000/generate_repair_guide', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                        body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Something went wrong with the API call.')
                }

                const data = await response.json();
                setRepairGuide(data.repair_guide);
            } catch (err) {
                console.error('Error generating repair guide:', err);
                setError(err.message || 'An unexpected error occurred.');
            } finally{
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <Stepper currentStep={currentStep} />
                        <div className="divide-y divide-gray-200">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {renderStepContent()}

                                <div className="pt-6 flex justify-between">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {loading ? 'GGenerating...' : currentStep === 4 ? 'Generate Repair Guide' : 'Next' }
                                        {currentStep === 4 ? 'Submit' : 'Next'}
                                    </button>
                                </div>
                            <form>
                             {/* Display Repair Guide or Error */}
                            {loading && (
                                <div className="mt-6 text-center text-blue-600">
                                    Generating repair guide...
                                </div>
                            )}
                            {error && (
                                <div className="mt-6 text-center text-red-600">
                                    Error: {error}
                                </div>
                            )}
                            {repairGuide && (
                                <div className="mt-6 p-4 border rounded-md bg-gray-50">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Generated Repair Guide:</h3>
                                    <pre className="whitespace-pre-wrap text-gray-800">{repairGuide}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserForm;