import { useState } from "react";
import { toast } from "react-toastify";

const input = `w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring focus:border-blue-500`;

const Form = () => {
  const [experiences, setExperiences] = useState([{}]);
  const [certificates, setCertificates] = useState([{}]);

  const addExperience = () => setExperiences([...experiences, {}]);
  const addCertificate = () => setCertificates([...certificates, {}]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // const formData = new FormData(e.target);
    // const data = Object.fromEntries(formData);
    // // Send data to backend API here
    // console.log(data);
    toast("Success", {
      position: "bottom-center",
      autoClose: 5000,
    });
  };
  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full flex justify-end">
        <button
          onClick={handleSubmit}
          className="py-2 px-5 bg-blue-500 text-slate-50 shadow rounded text-center hover:cursor-pointer"
        >
          Gửi
        </button>
      </div>
      <form className="max-w-3xl mx-auto p-4 space-y-6 border overflow-auto">
        {/* 1. Personal Information */}
        <section>
          <h2 className="text-xl font-bold mb-2">1. Thông tin cá nhân</h2>
          <div className="flex gap-[1rem]">
            <input
              name="age"
              placeholder="Nhập tuổi hiện tại (vd: 26)"
              className={input}
            />
            <input
              name="location"
              placeholder="Nhập Tỉnh / TP (vd: TP.HCM, Hà Nội)"
              className={input}
            />
          </div>
        </section>

        {/* 2. Desired Job Field */}
        <section>
          <h2 className="text-xl font-bold mb-2">2. Lĩnh vực mong muốn</h2>
          <input
            name="desired_field"
            placeholder="VD: Lập trình backend, Data Engineer, UI/UX..."
            className={input}
          />
        </section>

        {/* 3. Work Experience */}
        <section>
          <h2 className="text-xl font-bold mb-2">3. Kinh nghiệm làm việc</h2>
          {experiences.map((_, i) => (
            <div key={i} className="space-y-2 border p-2 rounded mb-2">
              <input
                name={`job_title_${i}`}
                placeholder="Chức danh"
                className={input}
              />
              <input
                name={`company_${i}`}
                placeholder="Tên công ty"
                className={input}
              />
              <input
                name={`duration_${i}`}
                placeholder="Thời gian làm việc"
                className={input}
              />
              <input
                name={`job_description_${i}`}
                placeholder="Mô tả công việc"
                className={input}
              />
            </div>
          ))}
          <button type="button" onClick={addExperience} className="btn">
            + Thêm kinh nghiệm
          </button>
        </section>

        {/* 4. Education */}
        <section>
          <h2 className="text-xl font-bold mb-2">4. Học vấn</h2>
          <input
            name="school_name"
            placeholder="VD: ĐH Bách Khoa - CNTT"
            className={input}
          />
          <input
            name="study_period"
            placeholder="VD: 2017 - 2021"
            className={input}
          />
          <input
            name="achievements"
            placeholder="VD: GPA 3.5/4, Học bổng..."
            className={input}
          />
        </section>

        {/* 5. Certificates */}
        <section>
          <h2 className="text-xl font-bold mb-2">5. Chứng chỉ</h2>
          {certificates.map((_, i) => (
            <div key={i} className="space-y-2 border p-2 rounded mb-2">
              <input
                name={`cert_name_${i}`}
                placeholder="Tên chứng chỉ"
                className={input}
              />
              <input
                name={`cert_org_${i}`}
                placeholder="Tổ chức cấp"
                className={input}
              />
              <input
                name={`cert_date_${i}`}
                placeholder="Ngày cấp"
                className={input}
              />
            </div>
          ))}
          <button type="button" onClick={addCertificate} className="btn">
            + Thêm chứng chỉ
          </button>
        </section>

        {/* 6. Hobbies */}
        <section>
          <h2 className="text-xl font-bold mb-2">
            6. Sở thích & hoạt động cá nhân
          </h2>
          <input
            name="hobbies"
            placeholder="VD: Đọc sách, viết blog..."
            className={input}
          />
        </section>

        {/* 7. Career Goals */}
        <section>
          <h2 className="text-xl font-bold mb-2">7. Định hướng nghề nghiệp</h2>
          <textarea
            name="career_goals"
            placeholder="VD: Muốn trở thành Senior..."
            className={input}
          ></textarea>
        </section>

        {/* 8. Expected Salary */}
        <section>
          <h2 className="text-xl font-bold mb-2">8. Mức lương mong muốn</h2>
          <input
            name="salary_expectation"
            placeholder="VD: 20 triệu/tháng, hoặc 'thoả thuận'"
            className={input}
          />
        </section>
      </form>
    </div>
  );
};

export default Form;
