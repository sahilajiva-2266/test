const rules = {
  contractorId: {
    required: true,
    type: "string", // could also be ObjectId if backend uses references
    errorMessage: "Contractor ID is required.",
  },
  rfidCardId: {
    required: true,
    type: "string", 
    errorMessage: "RFID Card ID is required.",
  },
  sectionAssigned: {
    required: true,
    type: "string",
    errorMessage: "Section Assigned is required.",
  },
  date: {
    required: true,
    type: "string", // or "date" if validator supports
    errorMessage: "Date is required and must be valid.",
  },
  entryGateIn: {
    required: true,
    type: "string", // or "datetime"
    errorMessage: "Entry Gate In time is required.",
  },
  workfloorIn: {
    required: true,
    type: "string", // or "datetime"
    errorMessage: "Workfloor In time is required.",
  },
  workfloorOut: {
    required: true,
    type: "string", // or "datetime"
    errorMessage: "Workfloor Out time is required.",
  },
  exitGateOut: {
    required: true,
    type: "string", // or "datetime"
    errorMessage: "Exit Gate Out time is required.",
  },
  remarks: {
    required: false,
    type: "string",
    errorMessage: "Remarks must be text if provided.",
  },
};

export default rules;
