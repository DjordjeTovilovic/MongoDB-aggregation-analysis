//1. 10 gradova sa najvise oglasa za posao u Francuskoj
db.getCollection("jobs").aggregate([
  {
    $match: {
      $and: [{ "_id.country": "France", "_id.location": { $ne: "" } }],
    },
  },
  {
    $group: {
      _id: "$_id.location",
      jobListingCount: { $sum: "$jobListingCount" },
    },
  },
  { $sort: { jobListingCount: -1 } },
  { $limit: 10 },
]);

//2. Prosecna plata u zavisnosti od velicine firme u Velikoj Britaniji
db.getCollection("salaries").aggregate([
  { $match: { "_id.country": "United Kingdom" } },
  { $unwind: "$jobDetails" },
  {
    $group: {
      _id: "$jobDetails.empSize",
      payPercentile90: { $avg: "$avgPayPercentile90" },
    },
  },
  { $sort: { payPercentile90: -1 } },
]);

//3. 5 Najplacenijih poslova u Velikoj Britaniji
db.getCollection("salaries").aggregate([
  { $match: { "_id.country": "United Kingdom" } },
  { $sort: { maxPayPercentile90: -1 } },
  { $limit: 5 },
  {
    $project: {
      _id: 0,
      jobTitle: "$_id.jobTitle",
      maxPayPercentile90: "$maxPayPercentile90",
    },
  },
]);

//4. Najbolje prosecno ocenjene kompanije sa bar 50 ocena zaposlenih
db.getCollection("reviews").aggregate([
  { $match: { reviewsCount: { $gt: 50 } } },
  { $sort: { avgOverallRating: -1, reviewsCount: -1 } },
]);

//5. Prosecna plata programera i seniora u Velikoj Britaniji i Njemacka
db.getCollection("salaries").aggregate([
  {
    $match: {
      "_id.country": { $in: ["Germany", "United Kingdom"] },
      "_id.jobTitle": {
        $in: ["Software Engineer", "Senior Software Engineer"],
      },
    },
  },
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
