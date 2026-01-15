
const paginate = async (
  model,
  query = {},
  page = 0,
  limit = 10,
  populateFields = [],
  searchFields = [],
  searchTerm = ""
) => {
  page = parseInt(page) || 0;
  limit = parseInt(limit) || 10;
  const skip = page * limit;

  console.log("🔹 Search Term Before Processing:", searchTerm);

  try {
    let searchQuery = { ...query };

    if (
      typeof searchTerm === "string" &&
      searchTerm.trim().length > 0 &&
      searchFields.length > 0
    ) {
      const searchRegex = new RegExp(searchTerm, "i");

      // Get schema paths
      const schemaPaths = model.schema.paths;

      const searchConditions = searchFields
        .filter((field) => {
          // Ensure field exists and is of type String
          return schemaPaths[field] && schemaPaths[field].instance === "String";
        })
        .map((field) => ({
          [field]: { $regex: searchRegex }
        }));

      if (searchConditions.length > 0) {
        searchQuery = {
          ...searchQuery,
          $or: searchConditions
        };
      }
    }

    console.log("🔍 Final MongoDB Query:", JSON.stringify(searchQuery, null, 2));

    let queryExec = model.find(searchQuery).skip(skip).limit(limit);

    if (populateFields.length) {
      populateFields.forEach((field) => {
        queryExec = queryExec.populate(field);
      });
    }

    const data = await queryExec;
    console.log("📌 Retrieved Records:", data.length);

    const totalrecords = await model.countDocuments(searchQuery);

    return {
      status: true,
      message:
        data.length > 0 ? "Records fetched successfully" : "No records found",
      data,
      pagination: {
        totalrecords,
        currentPage: page,
        totalPages: Math.ceil(totalrecords / limit),
        limit
      }
    };
  } catch (error) {
    console.error("❌ Pagination Error:", error);
    throw new Error("Error fetching records");
  }
};

module.exports = paginate;
