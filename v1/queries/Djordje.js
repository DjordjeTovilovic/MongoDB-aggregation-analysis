//1. 10 gradova sa najvise oglasa za posao
db.getCollection("glassdoor").aggregate([
  { $match: { location: { $ne: "" } } },
  { $group: { _id: "$location", jobListingCount: { $sum: 1 } } },
  { $sort: { jobListingCount: -1 } },
  { $limit: 10 },
]);

//2. Prosecna plata u zavisnosti od velicine firme u Velikoj Britaniji
db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  { $match: { country: "United Kingdom" } },
  {
    $group: {
      _id: "$empSize",
      payPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
  { $sort: { payPercentile90: -1 } },
]);

//3. 5 Najplacenijih poslova u Velikoj Britaniji
db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  { $match: { country: "United Kingdom" } },
  {
    $group: {
      _id: { country: "$country", jobTitle: "$salaries.jobTitle" },
      maxPayPercentile90: { $max: "$salaries.payPercentile90" },
    },
  },
  { $sort: { maxPayPercentile90: -1 } },
  { $limit: 5 },
  {
    $project: {
      _id: 0,
      jobTitle: "$_id.jobTitle",
      maxPayPercentile90: 1,
    },
  },
]);

//4. Najbolje prosecno ocenjene kompanije sa bar 50 ocena zaposlenih
db.getCollection("glassdoor").aggregate([
  { $unwind: "$reviews" },
  {
    $group: {
      _id: "$empName",
      rating: { $avg: "$reviews.overallRating" },
      numOfRating: { $sum: 1 },
    },
  },
  { $match: { numOfRating: { $gt: 50 } } },
  { $sort: { rating: -1, numOfRating: -1 } },
]);

//5. Plate programera i seniora u Velikoj Britaniji i Njemacka
db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  {
    $match: {
      country: { $in: ["Germany", "United Kingdom"] },
      "salaries.jobTitle": {
        $in: ["Software Engineer", "Senior Software Engineer"],
      },
    },
  },
  {
    $group: {
      _id: { country: "$country", jobTitle: "$salaries.jobTitle" },
      avgPayPercentile10: { $avg: "$salaries.payPercentile10" },
      avgPayPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
  { $sort: { avgPayPercentile90: -1 } },
  {
    $project: {
      _id: 0,
      jobTitle: "$_id.jobTitle",
      coutry: "$_id.country",
      avgPayPercentile10: 1,
      avgPayPercentile90: 1,
    },
  },
]);
