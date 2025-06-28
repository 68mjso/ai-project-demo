import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const input = `w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`;
const textarea = `w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none`;

const stages = [
  { id: 1, title: 'Personal Info', icon: '👤' },
  { id: 2, title: 'Career Goals', icon: '🎯' },
  { id: 3, title: 'Experience', icon: '💼' },
  { id: 4, title: 'Education', icon: '🎓' },
  { id: 5, title: 'Certifications', icon: '📜' },
  { id: 6, title: 'Final Details', icon: '✨' },
];

const Form = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [experiences, setExperiences] = useState([{}]);
  const [certificates, setCertificates] = useState([{}]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const addExperience = () => setExperiences([...experiences, {}]);
  const addCertificate = () => setCertificates([...certificates, {}]);

  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { handleSubmit, selectConversation } = context;

  const handleFormData = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const newData = new FormData(form);
    const dataObj: Record<string, string> = {};

    for (const [key, value] of newData.entries()) {
      dataObj[key] = value as string;
    }

    setFormData((prev) => ({ ...prev, ...dataObj }));
  };

  const nextStage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFormData(e);
    if (currentStage < stages.length) {
      setCurrentStage(currentStage + 1);
    }
  };

  const prevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFormData(e);

    // Create a combined form data object
    const currentData = new FormData(e.currentTarget);
    const combinedData: Record<string, string> = { ...formData };

    for (const [key, value] of currentData.entries()) {
      combinedData[key] = value as string;
    }

    // Create a mock form with combined data
    const mockForm = document.createElement('form');
    Object.entries(combinedData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key;
      input.value = value;
      mockForm.appendChild(input);
    });

    const mockEvent = {
      ...e,
      preventDefault: () => {},
      currentTarget: mockForm,
    } as unknown as React.FormEvent<HTMLFormElement>;

    const conversationId = await handleSubmit(mockEvent);
    if (conversationId) {
      selectConversation(conversationId);
      setTimeout(() => navigate('/chat'), 1000);
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👤</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with some basic information about you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  name="age"
                  placeholder="e.g., 26"
                  className={input}
                  defaultValue={formData.age || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  name="location"
                  placeholder="e.g., Ho Chi Minh City, Hanoi"
                  className={input}
                  defaultValue={formData.location || ''}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Career Goals</h2>
              <p className="text-gray-600">Tell us about your career aspirations</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Desired Job Field
                </label>
                <input
                  name="desired_field"
                  placeholder="e.g., Backend Development, Data Engineering, UI/UX Design..."
                  className={input}
                  defaultValue={formData.desired_field || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Career Aspirations
                </label>
                <textarea
                  name="career_goals"
                  placeholder="e.g., Want to become a Senior Developer, lead technical teams..."
                  className={textarea}
                  rows={4}
                  defaultValue={formData.career_goals || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Salary Expectations
                </label>
                <input
                  name="salary_expectation"
                  placeholder="e.g., $2000/month, or 'Negotiable'"
                  className={input}
                  defaultValue={formData.salary_expectation || ''}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💼</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Experience</h2>
              <p className="text-gray-600">Share your professional experience</p>
            </div>
            <div className="space-y-4">
              {experiences.map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience #{i + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Job Title
                      </label>
                      <input name={`job_title_${i}`} placeholder="Job Title" className={input} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input name={`company_${i}`} placeholder="Company Name" className={input} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      name={`duration_${i}`}
                      placeholder="Work Duration (e.g., 2021-2023)"
                      className={input}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Description & Achievements
                    </label>
                    <textarea
                      name={`job_description_${i}`}
                      placeholder="Job Description and Key Achievements"
                      className={textarea}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                + Add Another Experience
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Education</h2>
              <p className="text-gray-600">Tell us about your educational background</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-100 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School & Major
                </label>
                <input
                  name="school_name"
                  placeholder="e.g., University of Technology - Computer Science"
                  className={input}
                  defaultValue={formData.school_name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Study Period
                </label>
                <input
                  name="study_period"
                  placeholder="e.g., 2017 - 2021"
                  className={input}
                  defaultValue={formData.study_period || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Achievements
                </label>
                <input
                  name="achievements"
                  placeholder="e.g., GPA 3.5/4, Scholarships..."
                  className={input}
                  defaultValue={formData.achievements || ''}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📜</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Certifications</h2>
              <p className="text-gray-600">Share your professional certifications</p>
            </div>
            <div className="space-y-4">
              {certificates.map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Certificate #{i + 1}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Certificate Name
                      </label>
                      <input
                        name={`cert_name_${i}`}
                        placeholder="Certificate Name"
                        className={input}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Issuing Organization
                      </label>
                      <input
                        name={`cert_org_${i}`}
                        placeholder="Issuing Organization"
                        className={input}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Issue Date
                      </label>
                      <input name={`cert_date_${i}`} placeholder="Issue Date" className={input} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addCertificate}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                + Add Another Certificate
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Final Details</h2>
              <p className="text-gray-600">Last but not least, tell us about your interests</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-100 rounded-xl p-6 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests & Personal Activities
                </label>
                <textarea
                  name="hobbies"
                  placeholder="e.g., Reading, writing technical blogs, contributing to open source..."
                  className={textarea}
                  rows={4}
                  defaultValue={formData.hobbies || ''}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-lg border-b shrink-0">
        <div className="mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Information</h1>
          <p className="text-gray-600 mb-4">
            Complete your profile to get personalized AI-powered career analysis
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {currentStage} of {stages.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStage / stages.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between items-center">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`flex flex-col items-center ${
                  currentStage >= stage.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mb-1 transition-all duration-200 ${
                    currentStage >= stage.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStage > stage.id ? '✓' : stage.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">{stage.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form
        onSubmit={currentStage === stages.length ? onSubmit : nextStage}
        className="grow flex flex-col min-h-0"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-xl shadow-lg p-6">{renderStageContent()}</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white border-t shadow-lg flex-shrink-0">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={prevStage}
                disabled={currentStage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  currentStage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md hover:shadow-lg'
                }`}
              >
                ← Previous
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Step {currentStage} of {stages.length}
                </span>
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    currentStage === stages.length
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  {currentStage === stages.length ? '🚀 Start AI Analysis' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
