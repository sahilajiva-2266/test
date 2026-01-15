import React, { useState, useEffect } from "react";
import { API } from "../../../helpers/api.js";
import Validator from "../../../helpers/validators.js";
import {toast} from "react-toastify";
import rules from "../Rules.js";
const TeacherForm = () => {
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    first_name: false,
    middleName: false,
    last_name: false,
    email: false,
    phone: false,
    dob: false,
    gender: false,
    bloodGroup: false,
    address: false,
  });
  const [formData, setFormData] = useState(initialFormData);
  const validator = new Validator(rules);
  // Validate the entire form
  const validateForm = async () => {
    const validationErrors = await validator.validate(formData, rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  // Validate input field on blur
  const handleBlur = async (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const fieldErrors = await validator.validate(
      { [name]: value },
      { [name]: rules[name] }
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[name] || "",
    }));
  };
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked");
    setLoading(true);

    const isValid = await validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting data:", formData);
      const result = await API.createteacher(formData);
      console.log("API Response:", result);

      if (result.status === true) {
        toast.success("Teacher created successfully!");
        setFormData(initialFormData); // Reset form
      } else {
        toast.error(result.message || "Failed to create Teacher.");
      }
    } catch (error) {
      console.error("Error creating Teacher:", error);
      toast.error(
        "An error occurred while creating the Teacher. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  // Get field class name based on error state
  const getFieldClassName = (fieldName) => {
    return errors[fieldName] ? "field-error" : "field";
  };

  const [otherExpertise, setOtherExpertise] = useState([
    { name: "", title: "", year: "", upload: null },
  ]);
  const addOtherExpertise = () => {
    setOtherExpertise([
      ...otherExpertise,
      { name: "", title: "", year: "", upload: null },
    ]);
  };
  const removeOtherExpertise = (indexToRemove) => {
    setOtherExpertise(
      otherExpertise.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleExpertiseChange = (index, field, value) => {
    const updated = [...otherExpertise];
    updated[index][field] = value;
    setOtherExpertise(updated);
  };

  const [qualifications, setQualifications] = useState([
    { qualification: "", university: "", year: "", file: null },
  ]);
  // qualification section
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { qualification: "", university: "", year: "", file: null },
    ]);
  };
  const removeQualification = (indexToRemove) => {
    setQualifications(
      qualifications.filter((_, index) => index !== indexToRemove)
    );
  };
  const [userData, setUserData] = useState({
    joiningDate: "",
    leavingdate: "",
    experience: "",
  });
  const [bankDetails, setBankDetails] = useState([
    { bankName: "", accountNumber: "", ifscCode: "", branch: "", file: null },
  ]);
  const addBankDetail = () => {
    setBankDetails([
      ...bankDetails,
      { bankName: "", accountNumber: "", ifscCode: "", branch: "", file: null },
    ]);
  };

  const removeBankDetail = (indexToRemove) => {
    setBankDetails(bankDetails.filter((_, index) => index !== indexToRemove));
  };

  const handleQualificationChange = (index, field, value) => {
    const updated = [...qualifications];
    updated[index][field] = value;
    setQualifications(updated);
  };

  const handleFileChange = (index, file) => {
    const updated = [...qualifications];
    updated[index].file = file;
    setQualifications(updated);
  };
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const teacherSkills = [
    "Classroom Management",
    "Curriculum Planning",
    "Lesson Planning",
    "Subject Matter Expertise",
    "Communication Skills",
    "Student Engagement",
    "Differentiated Instruction",
    "Assessment and Evaluation",
    "Technology Integration",
    "Collaboration with Colleagues",
    "Adaptability",
    "Conflict Resolution",
    "Critical Thinking",
    "Problem Solving",
    "Time Management",
    "Leadership",
    "Emotional Intelligence",
    "Creative Teaching",
    "Online Teaching Tools",
    "Google Classroom",
    "Microsoft Teams",
    "Zoom/Video Conferencing",
    "Parent Communication",
    "Behavior Management",
    "Inclusive Teaching",
    "Special Education Knowledge",
    "Multilingual Teaching",
    "STEM Instruction",
    "Arts Integration",
    "Team Teaching",
    "Data-Driven Instruction",
  ];
  const tqualifications = [
    "D.El.Ed (Diploma in Elementary Education)",
    "B.Ed (Bachelor of Education)",
    "M.Ed (Master of Education)",
    "B.El.Ed (Bachelor of Elementary Education)",
    "BTC (Basic Training Certificate)",
    "NTT (Nursery Teacher Training)",
    "CTET (Central Teacher Eligibility Test)",
    "STET (State Teacher Eligibility Test)",
    "TET (Teacher Eligibility Test)",
    "Ph.D in Education",
    "M.A. in Education",
    "BA/B.Sc + B.Ed (Integrated Degree)",
    "M.Phil in Education",
    "Diploma in Special Education",
    "UGC NET (National Eligibility Test)",
  ];
  const indianUniversities = [
    "University of Delhi (DU)",
    "Jawaharlal Nehru University (JNU)",
    "Banaras Hindu University (BHU)",
    "Jamia Millia Islamia (JMI)",
    "Aligarh Muslim University (AMU)",
    "Guru Gobind Singh Indraprastha University (GGSIPU)",
    "University of Mumbai",
    "Savitribai Phule Pune University",
    "University of Calcutta",
    "Jadavpur University",
    "University of Madras",
    "Anna University",
    "Osmania University",
    "Dr. B.R. Ambedkar Open University",
    "Panjab University",
    "Lovely Professional University (LPU)",
    "Amity University",
    "Christ University",
    "Symbiosis International University",
    "Tata Institute of Social Sciences (TISS)",
    "Indira Gandhi National Open University (IGNOU)",
    "Birla Institute of Technology and Science (BITS Pilani)",
    "Vellore Institute of Technology (VIT)",
    "SRM Institute of Science and Technology",
    "Manipal Academy of Higher Education",
  ];

  // Auto-calculate experience when joining or leaving date changes
  useEffect(() => {
    const { joiningDate, leavingdate } = userData;

    if (joiningDate && leavingdate) {
      const start = new Date(joiningDate);
      const end = new Date(leavingdate);

      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diffInMs = end - start;
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
        const roundedYears = Math.floor(diffInYears);

        setUserData((prev) => ({
          ...prev,
          experience: roundedYears,
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          experience: "",
        }));
      }
    }
  }, [userData.joiningDate, userData.leavingdate]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold  mb-4 px-3 ">Add Teacher</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-5 bg-white p-4 rounded-lg overflow-x-auto"
      >
        {/* Personal Info */}
        <div className="AJ-section AJ-left-section">
          <div className="AJ-Form-block AJ-crm-personal">
            <h3 className="text-xl font-bold">PERSONAL INFO</h3>
            <div className="border-t border-gray-300 w-full my-2"></div>

            <div className="grid  grid-cols-2 gap-y-1 gap-x-4 ">
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "first_name"
                  )} AJ-floating-input`}
                  placeholder=" "
                />
                {/* <span className="text-red-500">{errors.first_name}</span> */}
                <label className="AJ-floating-label">First Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "middleName"
                  )} AJ-floating-input`}
                  placeholder=" "
                />

                <label className="AJ-floating-label">Middle Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "last_name"
                  )} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Last Name</label>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("dob")} AJ-floating-input`}
                />

                <label className="AJ-floating-label">Date Of Birth</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("gender")} AJ-floating-input`}
                >
                  <option value=""> </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <label className="AJ-floating-label">Gender</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  name="bg"
                  value={formData.bg}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName(
                    "bg"
                  )} AJ-floating-select AJ-floating-input`}
                >
                  <option value="" disabled></option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>

                <label className="AJ-floating-label">Blood Group</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("email")} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Email</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  autoComplete="off"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${getFieldClassName("phone")} AJ-floating-input`}
                  placeholder=""
                />

                <label className="AJ-floating-label">Phone</label>
              </div>

              <div></div>
            </div>
            <div className="AJ-floating-label-wrapper ">
              <textarea className="AJ-floating-textarea AJ-floating-input "></textarea>
              <label className="AJ-floating-label">Address</label>
            </div>
            <div className="AJ-floating-label-wrapper  ">
              <select
                className="AJ-floating-select AJ-floating-input"
                name="skills"
                multiple
              >
                <option disabled>select </option>

                {teacherSkills.map((skills) => (
                  <option key={skills} value={skills}>
                    {skills}
                  </option>
                ))}
              </select>

              <label className="AJ-floating-label">Skills</label>
            </div>
          </div>
          {/* Verification Info */}
          <div className="AJ-Form-block AJ-crm-personal">
            <div className="">
              <h3 className="text-xl font-bold">VERIFICATION & DOCUMENTS</h3>
              <div className="border-t border-gray-300 w-full my-2"></div>
              <div className="AJ-crm-combinition space-y-4 grid  grid-cols-1 gap-y-1 gap-x-4 ">
                <div className="file-upload flex  ">
                  <input
                    className="  hidden"
                    type="file"
                    name="adharcard"
                    id="adharcard"
                  />
                  <div className="AJ-crm-adhar-label">
                    <label className="text-sm">Upload Adhar Card :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="adharcard"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {formData.adharcard
                        ? `Selected: ${formData.adharcard.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    name="pancard"
                    id="pancard"
                  />
                  <div className="AJ-crm-pan-label">
                    <label className="text-sm">Upload Pan Card :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="pancard"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {formData.pancard
                        ? `Selected: ${formData.pancard.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    name="voterid"
                    id="voterid"
                  />
                  <div className="AJ-crm-voter-label">
                    <label className="text-sm">Upload Voter Id :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="voterid"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {formData.voterid
                        ? `Selected: ${formData.voterid.name}`
                        : " + Upload file "}
                    </label>
                  </div>
                </div>
                <div className="file-upload flex justify-around">
                  <input
                    className="AJ-floating-input hidden"
                    type="file"
                    name="photo"
                    id="photo"
                  />
                  <div className="AJ-crm-photo-label">
                    <label className="text-sm">Upload Photograph :</label>
                  </div>
                  <div className="AJ-crm-upload-point">
                    <label
                      htmlFor="photo"
                      className="block text-xs border border-gray-300 rounded-md px-4 py-2 text-gray-600 bg-gray-100 text-center cursor-pointer hover:bg-gray-200"
                    >
                      {formData.photo
                        ? `Selected: ${formData.photo.name}`
                        : " + Upload file"}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="AJ-Form-block AJ-crm-personal">
            <div className="AJ-crm-submiting-section flex items-end">
              <div>
                <button
                  type="submit"
                  className="mt-4 mx-auto block  text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Creating..." : "Create Teacher"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="AJ-section AJ-right-section h-auto">
          <div className="border-l border-gray-300 h-auto"></div>
          {/* Professional Info */}
          <div className="AJ-Form-block AJ-crm-professional">
            <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full  mb-5 border-b -borderDarkBlue    ">
              <div className="AJ-crm-qualification">
                <h3 className="text-xl font-bold">QUALIFICATIONS</h3>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addQualification}
                  className=" bg-green-600 text-white px-3 py-1 mb-1 mr-12 rounded"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="AJ-crm-combinition space-y-4 grid grid-cols-1 gap-4">
              {qualifications.map((q, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-y-1 gap-x-3 AJ-floating-label-wrapper"
                >
                  <div className="AJ-floating-label-wrapper">
                    <select
                      name={`qualification-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={q.qualification}
                      onChange={(e) =>
                        handleQualificationChange(
                          index,
                          "qualification",
                          e.target.value
                        )
                      }
                    >
                      <option disabled></option>
                      {tqualifications.map((qualification) => (
                        <option value={qualification}>{qualification}</option>
                      ))}
                    </select>

                    <label className="AJ-floating-label">Qualification</label>
                  </div>

                  <div className="first-left AJ-floating-label-wrapper ">
                    <select
                      name={`university-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={q.university}
                      onChange={(e) =>
                        handleQualificationChange(
                          index,
                          "university",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      {indianUniversities.map((indianUniversiy) => (
                        <option value={indianUniversiy}>
                          {indianUniversiy}
                        </option>
                      ))}
                    </select>

                    <label className="AJ-floating-label">University</label>
                  </div>

                  <div className="AJ-floating-label-wrapper ">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name={`year-${index}`}
                      placeholder=""
                      value={q.year}
                      onChange={(e) =>
                        handleQualificationChange(index, "year", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Year</label>
                  </div>

                  <div className="AJ-crm-upload-point-qualification relative">
                    <input
                      className="AJ-floating-input hidden"
                      type="file"
                      name={`documents-${index}`}
                      id={`documents-${index}`}
                      onChange={(e) =>
                        handleFileChange(index, e.target.files[0])
                      }
                    />
                    <label
                      htmlFor={`documents-${index}`}
                      className="inline-block text-sm border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-gray-100 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
                    >
                      {q.documents
                        ? `Selected: ${q.documents.name}`
                        : "+ Upload file"}
                    </label>
                  </div>

                  {index > 0 && (
                    <div className="AJ-crm-remove-button flex items-end">
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="rounded bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                      >
                        <svg
                          fill="white"
                          width={28}
                          height={28}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* qualification */}
          <div className="AJ-Form-block AJ-crm-qualifications">
            <h3 className="text-xl font-bold">PROFESSIONAL INFO</h3>
            <div className="border-t border-gray-300 w-full my-2"></div>
            <div className="grid  grid-cols-2 gap-y-1 gap-x-4">
              <div className="AJ-floating-label-wrapper ">
                <input
                  className="AJ-floating-input"
                  type="text"
                  name="designation"
                  placeholder=""
                />
                <label className="AJ-floating-label">Designation</label>
              </div>
              <div className=" grid  grid-cols-2 gap-y-1 gap-x-4">
                <div className="AJ-floating-label-wrapper ">
                  <input
                    className="AJ-floating-input"
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    placeholder=""
                  />

                  <label className="AJ-floating-label">Joining Date</label>
                </div>
                <div className="AJ-floating-label-wrapper ">
                  <input
                    className="AJ-floating-input"
                    type="date"
                    name="leavingdate"
                    value={formData.leavingdate}
                    placeholder=""
                  />

                  <label className="AJ-floating-label">Leaving Date</label>
                </div>
              </div>

              <div className="AJ-floating-label-wrapper ">
                <input
                  className="AJ-floating-input"
                  type="number"
                  name="employeeid"
                  value={formData.employeeid}
                  placeholder=""
                />
                <label className="AJ-floating-label">Employee Id</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  className="AJ-floating-input"
                  type="number"
                  name="experience"
                  value={formData.experience}
                  readOnly
                  placeholder=""
                />
                <label className="AJ-floating-label">Years Of Experience</label>
              </div>
              <div className="AJ-floating-label-wrapper ">
                <input
                  className="AJ-floating-input"
                  type="number"
                  name="subjectsTaught"
                  placeholder=""
                />
                <label className="AJ-floating-label">Subjects Taught</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  className="AJ-floating-select AJ-floating-input"
                  name="classhandled"
                >
                  <option value=""> </option>
                  <option value="one">1</option>
                  <option value="two">2</option>
                  <option value="three">3</option>
                  <option value="four">4</option>
                  <option value="five">5</option>
                  <option value="six">6</option>
                  <option value="seven">7</option>
                  <option value="eight">8</option>
                  <option value="nine">9</option>
                  <option value="ten">10</option>
                </select>

                <label className="AJ-floating-label">Class Handled</label>
              </div>
            </div>
            <div className="AJ-crm-combinition space-y-4  grid  grid-cols-2 gap-y-1 gap-x-4">
              <div className="AJ-floating-label-wrapper ">
                <input
                  className="AJ-floating-input"
                  type="number"
                  name="previousinstitute"
                  placeholder=""
                />
                <label className="AJ-floating-label">Previous Institute</label>
              </div>
              <div className="AJ-floating-label-wrapper  ">
                <select
                  name="university"
                  className="AJ-floating-select AJ-floating-input"
                >
                  <option value="">select </option>
                  <option value="communication">Communication</option>
                  <option value="leadership">Leadership</option>
                  <option value="computerskills">Computer Skills</option>
                  <option value="subjectexpertise">Subject Expertise</option>
                </select>

                <label className="AJ-floating-label">Skills</label>
              </div>
            </div>
          </div>

          {/* other expertise */}
          <div className="AJ-Form-block AJ-crm-expertise">
            <div>
              <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full my-2 mt-8 border-b -borderDarkBlue   pb-2 ">
                <div className="AJ-crm-qualification">
                  <div>
                    <h3 className="text-xl font-bold">OTHER EXPERTISE</h3>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addOtherExpertise}
                    className="mt-2 bg-green-600 text-white px-3 py-1 mr-12 rounded"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
            <div className="AJ-crm-combinition space-y-4 grid grid-cols-1 gap-4">
              {otherExpertise.map((expertise, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-y-1 gap-x-3 AJ-floating-label-wrapper "
                >
                  <div className="AJ-floating-label-wrapper">
                    <input
                      className="AJ-floating-input"
                      type="text"
                      name={`expertise-name-${index}`}
                      placeholder=""
                      value={expertise.name}
                      onChange={(e) =>
                        handleExpertiseChange(index, "name", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Name</label>
                  </div>

                  <div className="AJ-floating-label-wrapper">
                    <select
                      name={`expertise-title-${index}`}
                      className="AJ-floating-select AJ-floating-input"
                      value={expertise.title}
                      onChange={(e) =>
                        handleExpertiseChange(index, "title", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="communication">Communication</option>
                      <option value="teamwork">Teamwork</option>
                      <option value="leadership">Leadership</option>
                      <option value="creativity">Creativity</option>
                    </select>
                    <label className="AJ-floating-label">Title</label>
                  </div>

                  <div className="AJ-floating-label-wrapper ">
                    <input
                      className="AJ-floating-input"
                      type="number"
                      name={`expertise-year-${index}`}
                      placeholder=""
                      value={expertise.year}
                      onChange={(e) =>
                        handleExpertiseChange(index, "year", e.target.value)
                      }
                    />
                    <label className="AJ-floating-label">Year</label>
                  </div>

                  <div className="AJ-crm-upload-point-qualification relative">
                    <input
                      className="AJ-floating-input hidden"
                      type="file"
                      name={`expertise-upload-${index}`}
                      id={`expertise-upload-${index}`}
                      onChange={(e) =>
                        handleExpertiseChange(
                          index,
                          "upload",
                          e.target.files[0]
                        )
                      }
                    />
                    <label
                      htmlFor={`expertise-upload-${index}`}
                      className="inline-block text-sm border border-gray-300 rounded-lg px-4 py-2 text-gray-700 bg-gray-100 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
                    >
                      {expertise.upload
                        ? `Selected: ${expertise.upload.name}`
                        : "+ Upload file"}
                    </label>
                  </div>

                  {index > 0 && (
                    <div className="AJ-crm-remove-button flex items-end">
                      <button
                        type="button"
                        onClick={() => removeOtherExpertise(index)}
                        className="rounded bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                      >
                        <svg
                          fill="white"
                          width={28}
                          height={28}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                        >
                          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* bank details */}
          <div className="AJ-Form-block AJ-crm-qualifications">
            <div className="AJ-crm-top-most-title-with-add flex justify-between  border-gray-300 w-full my-2 mb-3    pb-2 border-b ">
              <div className="AJ-crm-qualification">
                <h3 className="text-xl font-bold">BANK DETAILS</h3>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addBankDetail}
                  // onClick={addBankDetails}
                  className="mt-2 bg-green-600 text-white px-3 py-1 mr-12 rounded"
                >
                  + Add
                </button>
              </div>
            </div>
            {bankDetails.map((bank, index) => (
              <div
                key={index}
                className=" AJ-crm-bank-section grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="accountholdername"
                    type="text"
                    placeholder=""
                    value={bank.accountholdername}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].accountholdername = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Account Holder </label>
                </div>
                <div className="AJ-crm-baniking ">
                  <input
                    className="AJ-floating-input"
                    type="text"
                    placeholder=""
                    value={bank.bankName}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].bankName = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">BankName</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="text"
                    value={bank.accountNumber}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].accountNumber = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Account Number</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="password"
                    value={bank.accountNumber}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].accountNumber = e.target.value;
                      // Simple matching check
                      if (updated[index].accountNumber !== e.target.value) {
                        updated[index].error = "Account number do not match";
                      } else {
                        updated[index].error = "";
                      }
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">
                    Reconfirm Account Number
                  </label>
                  {bank.error && (
                    <span className="text-red-500 text-sm">{bank.error}</span>
                  )}
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    name="ifscCode"
                    type="number"
                    value={bank.ifscCode}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].ifscCode = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">IFSC Code</label>
                </div>

                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="cisf"
                    placeholder=""
                    type="number"
                    value={bank.cisf}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].cisf = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">CISF Code</label>
                </div>
                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    name="micr"
                    placeholder=""
                    type="number"
                    value={bank.micr}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].micr = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">MICR Code</label>
                </div>

                <div className="AJ-crm-baniking">
                  <input
                    className="AJ-floating-input"
                    placeholder=""
                    type="text"
                    value={bank.branch}
                    onChange={(e) => {
                      const updated = [...bankDetails];
                      updated[index].branch = e.target.value;
                      setBankDetails(updated);
                    }}
                  />
                  <label className="AJ-floating-label">Branch</label>
                </div>

                <div className=" AJ-crm-bank-section ">
                  <div className="AJ-crm-baniking grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
                    <input
                      className="AJ-floating-input"
                      placeholder=""
                      type="file"
                      name="documents"
                      onChange={(e) => {
                        const updated = [...bankDetails];
                        updated[index].file = e.target.files[0];
                        setBankDetails(updated);
                      }}
                    />
                    <label className="AJ-floating-label">Documents</label>
                  </div>
                </div>

                {/* Remove Button (only if more than one row and not the first row) */}
                {index > 0 && (
                  <button
                    type="button"
                    className="text-white bg-red-500 hover:bg-red-600 rounded px-2 py-1 mt-2"
                    onClick={() => removeBankDetail(index)}
                  >
                    <svg
                      fill="white"
                      width={28}
                      height={28}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                    >
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
      {loading && (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default TeacherForm;
