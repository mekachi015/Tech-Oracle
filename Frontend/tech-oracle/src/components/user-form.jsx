"use client"
import React, { useState } from 'react';
import './user-form.css';

const steps = ['User Details', 'Device Information', 'Technical Specs', 'Upload Files'];

const UserForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
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
    const [error, setError] = useState(null);

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
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const renderUserDetails = () => (
        <div className="form-section">
            <h2>User Details</h2>
            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                />
            </div>
            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                />
            </div>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                />
            </div>
            <div className="form-group">
                <label>Address</label>
                <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    required
                    placeholder="Enter your address"
                />
            </div>
        </div>
    );

    const renderDeviceInfo = () => (
        <div className="form-section">
            <h2>Device Information</h2>
            <div className="form-group">
                <label>Device Brand</label>
                <input
                    type="text"
                    name="deviceBrand"
                    value={formData.deviceBrand}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Apple, Samsung, Dell, HP"
                />
            </div>
            <div className="form-group">
                <label>Device Type</label>
                <input
                    type="text"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Smartphone, Laptop, Desktop, Tablet"
                />
            </div>
            <div className="form-group">
                <label>Device Model</label>
                <input
                    type="text"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., MacBook Pro, Galaxy S23"
                />
            </div>
            <div className="form-group">
                <label>Model Number/SKU (Optional)</label>
                <input
                    type="text"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., A2141, SM-G991U"
                />
            </div>
            <div className="form-group">
                <label>Serial Number (Optional)</label>
                <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Device serial number"
                />
            </div>
            <div className="form-group">
                <label>Device Issues/Problems</label>
                <textarea
                    name="deviceIssue"
                    value={formData.deviceIssue}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="Please describe the problems you are experiencing with your device in detail..."
                />
                <small>Be as specific as possible about the issues you're experiencing. Include when the problem started and any error messages you've seen.</small>
            </div>
        </div>
    );

    const renderTechSpecs = () => (
        <div className="form-section">
            <h2>Technical Specifications</h2>
            <p>Optional but helps us provide better repair guidance</p>
            <div className="form-group">
                <label>Operating System</label>
                <select
                    name="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={handleInputChange}
                >
                    <option value="">Select OS</option>
                    <option value="Windows 11">Windows 11</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="macOS Sonoma">macOS Sonoma</option>
                    <option value="macOS Ventura">macOS Ventura</option>
                    <option value="Android 14">Android 14</option>
                    <option value="Android 13">Android 13</option>
                    <option value="iOS 17">iOS 17</option>
                    <option value="iOS 16">iOS 16</option>
                    <option value="Linux">Linux</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="form-group">
                <label>RAM/Memory</label>
                <select
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                >
                    <option value="">Select RAM</option>
                    <option value="2GB">2GB</option>
                    <option value="4GB">4GB</option>
                    <option value="8GB">8GB</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                    <option value="Unknown">Unknown</option>
                </select>
            </div>
            <div className="form-group">
                <label>Storage</label>
                <select
                    name="storage"
                    value={formData.storage}
                    onChange={handleInputChange}
                >
                    <option value="">Select Storage</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                    <option value="2TB">2TB</option>
                    <option value="Unknown">Unknown</option>
                </select>
            </div>
            <div className="form-group">
                <label>Processor (Optional)</label>
                <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleInputChange}
                    placeholder="e.g., Intel i7, Apple M2, Snapdragon 8 Gen 2"
                />
            </div>
            <div className="form-group">
                <label>Graphics Card (Optional)</label>
                <input
                    type="text"
                    name="graphicsCard"
                    value={formData.graphicsCard}
                    onChange={handleInputChange}
                    placeholder="e.g., NVIDIA RTX 3060, AMD Radeon"
                />
            </div>
            <div className="form-group">
                <label>Additional Information</label>
                <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any other details that might help with the repair..."
                />
            </div>
        </div>
    );

    const renderFileUpload = () => (
        <div className="form-section">
            <h2>Upload Files (Optional)</h2>
            <div className="form-group">
                <p>Upload photos or videos of the device issue</p>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                />
                <small>PNG, JPG, GIF, MP4 up to 10MB each</small>
                {formData.files.length > 0 && (
                    <div className="file-list">
                        <p>Selected files:</p>
                        <ul>
                            {Array.from(formData.files).map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderUserDetails();
            case 1:
                return renderDeviceInfo();
            case 2:
                return renderTechSpecs();
            case 3:
                return renderFileUpload();
            default:
                return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep < 3) {
            nextStep();
        } else {
            console.log('Form submitted:', formData);
            setLoading(true);
            setError('');
            setRepairGuide('');

            try {
                const payload = {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    emailAddress: formData.emailAddress,
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

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/add_repairs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Something went wrong with the API call.');
                }

                const data = await response.json();
                setRepairGuide('Repair request submitted successfully! Your repair record ID is: ' + data._id);
            } catch (err) {
                console.error('Error submitting repair request:', err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h1>Tech Oracle</h1>
                <p>AI-Powered Device Repair Assistant</p>
            </div>

            <div className="step-indicator">
                <p>Step {currentStep + 1} of {steps.length}: {steps[currentStep]}</p>
            </div>

            <form onSubmit={handleSubmit} className="repair-form">
                <div className="form-content">
                    {renderStepContent()}
                </div>

                <div className="form-buttons">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={currentStep === 0}
                        onClick={prevStep}
                    >
                        Previous
                    </button>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : currentStep === 3 ? 'Submit Request' : 'Next'}
                    </button>
                </div>
            </form>

            {loading && <div className="loading-message">Submitting your repair request...</div>}

            {error && (
                <div className="error-message">
                    <p>Error: {error}</p>
                </div>
            )}

            {repairGuide && (
                <div className="success-message">
                    <p>{repairGuide}</p>
                </div>
            )}

            <div className="footer-link">
                <p>
                    Are you a technician?{' '}
                    <a href="/technician">Access Dashboard</a>
                </p>
            </div>
        </div>
    );
};

export default UserForm;