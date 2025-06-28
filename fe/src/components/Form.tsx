import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const input = `w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring focus:border-blue-500`;

const Form = () => {
  const [experiences, setExperiences] = useState([{}]);
  const [certificates, setCertificates] = useState([{}]);
  const navigate = useNavigate();

  const addExperience = () => setExperiences([...experiences, {}]);
  const addCertificate = () => setCertificates([...certificates, {}]);

  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { handleSubmit, currentConversationId, selectConversation } = context;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const conversationId = await handleSubmit(e);
    if (conversationId) {
      selectConversation(conversationId);
      // Navigate to chat page after successful submission
      setTimeout(() => navigate('/chat'), 1000);
    }
  };

  // Show message if no conversation is selected
  if (!currentConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-4">No Conversation Selected</h2>
          <p className="text-gray-500">Please create a new conversation first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-blue-50 border-b">
        <h1 className="text-2xl font-bold text-blue-800">Profile Information Form</h1>
        <p className="text-blue-600">
          Fill out your information to start your AI-powered career analysis
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* 1. Personal Information */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">1. Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="age" placeholder="Age (e.g., 26)" className={input} />
                <input
                  name="location"
                  placeholder="Location (e.g., Ho Chi Minh City, Hanoi)"
                  className={input}
                />
              </div>
            </section>

            {/* 2. Desired Job Field */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">2. Career Goals</h2>
              <input
                name="desired_field"
                placeholder="e.g., Backend Development, Data Engineering, UI/UX Design..."
                className={input}
              />
            </section>

            {/* 3. Work Experience */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">3. Work Experience</h2>
              {experiences.map((_, i) => (
                <div key={i} className="space-y-2 border p-4 rounded mb-4 bg-gray-50">
                  <input name={`job_title_${i}`} placeholder="Job Title" className={input} />
                  <input name={`company_${i}`} placeholder="Company Name" className={input} />
                  <input
                    name={`duration_${i}`}
                    placeholder="Work Duration (e.g., 2021-2023)"
                    className={input}
                  />
                  <textarea
                    name={`job_description_${i}`}
                    placeholder="Job Description and Key Achievements"
                    className={input}
                    rows={3}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                + Add Experience
              </button>
            </section>

            {/* 4. Education */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">4. Education</h2>
              <input
                name="school_name"
                placeholder="e.g., University of Technology - Computer Science"
                className={input}
              />
              <input name="study_period" placeholder="e.g., 2017 - 2021" className={input} />
              <input
                name="achievements"
                placeholder="e.g., GPA 3.5/4, Scholarships..."
                className={input}
              />
            </section>

            {/* 5. Certificates */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">5. Certifications</h2>
              {certificates.map((_, i) => (
                <div key={i} className="space-y-2 border p-4 rounded mb-4 bg-gray-50">
                  <input name={`cert_name_${i}`} placeholder="Certificate Name" className={input} />
                  <input
                    name={`cert_org_${i}`}
                    placeholder="Issuing Organization"
                    className={input}
                  />
                  <input name={`cert_date_${i}`} placeholder="Issue Date" className={input} />
                </div>
              ))}
              <button
                type="button"
                onClick={addCertificate}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                + Add Certificate
              </button>
            </section>

            {/* 6. Hobbies */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                6. Interests & Personal Activities
              </h2>
              <textarea
                name="hobbies"
                placeholder="e.g., Reading, writing technical blogs, contributing to open source..."
                className={input}
                rows={3}
              />
            </section>

            {/* 7. Career Goals */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">7. Career Aspirations</h2>
              <textarea
                name="career_goals"
                placeholder="e.g., Want to become a Senior Developer, lead technical teams..."
                className={input}
                rows={4}
              />
            </section>

            {/* 8. Expected Salary */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-gray-800">8. Salary Expectations</h2>
              <input
                name="salary_expectation"
                placeholder="e.g., $2000/month, or 'Negotiable'"
                className={input}
              />
            </section>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t bg-gray-50">
          <div className="max-w-4xl mx-auto flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold"
            >
              Start AI Analysis
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
