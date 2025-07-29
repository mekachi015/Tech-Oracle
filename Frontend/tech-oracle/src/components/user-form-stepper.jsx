const Stepper = ({ currentStep}) => {
    const steps = [
        { id: 1 , name: 'User Details'},
        { id: 2 , name: 'Device Details'},
        { id: 3 , name: 'Technical SPecifications'},    
        { id: 4 , name: 'File Upload'}
    ];

    return (
            <nav aria-label="Progress" className="mb-8">
        <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
            <li
                key={step.name}
                className={`${
                stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                } relative`}
            >
                <div className="flex items-center">
                <div
                    className={`${
                    step.id <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    } rounded-full transition-colors flex h-8 w-8 items-center justify-center`}
                >
                    <span className="text-sm">{step.id}</span>
                </div>
                {stepIdx !== steps.length - 1 && (
                    <div
                    className={`hidden sm:block absolute top-4 w-full h-0.5 left-0 -translate-y-1/2 translate-x-8 ${
                        step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    />
                )}
                </div>
                <span className="absolute left-0 top-10 text-xs whitespace-nowrap">
                {step.name}
                </span>
            </li>
            ))}
        </ol>
        </nav>
    );
};

export default Stepper;