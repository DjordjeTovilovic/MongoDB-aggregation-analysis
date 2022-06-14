db.getCollection("glassdoor").find({ country: "Serbia" });
db.getCollection("glassdoor").find({ jobTitle: "Software Engineer" });
db.getCollection("glassdoor").find({ empName: "Microsoft" });

db.getCollection("glassdoor").aggregate([
  { $match: { country: { $in: ["UK", "United Kingdom"] } } },
  {
    $group: {
      _id: { empName: "$empName" },
      average: { $avg: "$salaries.payPercentile10" },
    },
  },
]);

db.getCollection("glassdoor").find({});

db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  {
    $match: {
      country: { $in: ["UK", "United Kingdom"] },
      "salaries.jobTitle": "Software Engineer",
    },
  },
  {
    $group: {
      _id: { jobTitle: "$salaries.jobTitle" },
      payPercentile10: { $avg: "$salaries.payPercentile10" },
      payPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
]);

db.getCollection("glassdoor").aggregate([
  { $unwind: "$salaries" },
  {
    $match: {
      country: { $in: ["US", "United States"] },
      "salaries.jobTitle": "Software Engineer",
    },
  },
  {
    $group: {
      _id: { jobTitle: "$salaries.jobTitle" },
      payPercentile10: { $avg: "$salaries.payPercentile10" },
      payPercentile90: { $avg: "$salaries.payPercentile90" },
    },
  },
]);

//{$group: { "_id": {"empName": "$empName"}}}])
//{$project: {"\_id": 1, "jobTitle": 1}}

db.getCollection("glassdoor").aggregate([
  { $match: { empName: "Microsoft" } },
  { $project: { _id: 1, "salaries.jobTitle": 1 } },
]); //,
