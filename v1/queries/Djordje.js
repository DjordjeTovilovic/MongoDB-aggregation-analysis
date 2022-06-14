//1. Plate programera i seniora u Velikoj Britaniji i Njemacka
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
      _id: { Country: "$country", jobTitle: "$salaries.jobTitle" },
      payPercentile10: { $avg: "$salaries.payPercentile10" },
      payPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
]);

//2. Prosecna ocena benefita ljudi koji su trenutno zaposleni i bivsi radnika
db.getCollection("glassdoor").aggregate([
  { $unwind: "$benefits" },
  { $match: { "benefits.city": "London" } },
  {
    $group: {
      _id: "$benefits.currentJob",
      rating: { $avg: "$benefits.rating" },
    },
  },
]);

//3. 5 Najplacenijih poslova u Velikoj Britaniji
db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  { $match: { country: { $in: ["United Kingdom"] } } },
  { $sort: { "salaries.payPercentile90": -1 } },
  { $limit: 5 },
  {
    $project: {
      jobTitle: "$salaries.jobTitle",
      payPercentile90: "$salaries.payPercentile90",
    },
  },
]);

//4. Prosecna plata u zavisnosti od velicine firme
db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  { $match: { country: { $in: ["United Kingdom"] } } },
  {
    $group: {
      _id: "$empSize",
      payPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
  { $sort: { payPercentile90: -1 } },
]);

//5. 10 gradova sa najvise oglasa za posao
db.getCollection("glassdoor").aggregate([
  { $match: { location: { $ne: "" } } },
  { $group: { _id: "$location", jobListingCount: { $sum: 1 } } },
  { $sort: { jobListingCount: -1 } },
  { $limit: 10 },
]);
