//Koja je najcesce rangirana industrija u Londonu?
db.jobs.aggregate([
  { $match: { "_id.location": "London" } },
  {
    $project: {
      industry: "$_id.industry",
      number: "$number",
      location: "$_id.location",
    },
  },
  { $match: { number: { $gt: 0 } } },
  { $sort: { number: -1 } },
  { $project: { most_rated_industry: "$industry" } },
  { $limit: 1 },
]);

// Koji je najcesci emp u Srbiji koji je ocenjen bar jednom, a radi za posao Softverskog inzinjera ili front end developera?
db.jobs.aggregate([
  { $match: { "_id.country": "Serbia" } },
  {
    $match: {
      $or: [
        { "_id.jobTitle": { $regex: "Software" } },
        { "_id.jobTitle": { $regex: "software" } },
        { "_id.jobTitle": { $regex: "front" } },
        { "_id.jobTitle": { $regex: "Front" } },
      ],
    },
  },
  { $project: { emp: "$_id.name", num: "$number" } },
  { $match: { num: { $gt: 0 } } },
  { $sort: { num: -1 } },
  { $limit: 1 },
  { $project: { emp: "$_id.empName", num: "$num" } },
]);

// Koji su top 5 industrija u kojima Softverski inzinjeri zaradjuju navise para?
db.salary_per_job.aggregate([
  { $match: { "_id.jobTitle": "Software Engineer" } },
  {
    $project: { industry: "$_id.industry", average_salary: "$average_salary" },
  },
  { $sort: { average_salary: -1 } },
  { $limit: 5 },
]);

//Izlistaj koji poslovi imaju benefit sportskih usluga, kao i koliko ih ima?
db.benefits.aggregate([
  {
    $match: {
      $or: [
        { "_id.comments": { $regex: "Sport" } },
        { "_id.comments": { $regex: "sport" } },
        { "_id.comments": { $regex: "Sports" } },
        { "_id.comments": { $regex: "sports" } },
      ],
    },
  },
  { $project: { jobTitle: "$_id.jobTitle" } },
  { $group: { _id: "$jobTitle", count: { $sum: 1 } } },
  { $project: { jobTitle: "$_id", num_of_jobs_with_this_benefit: "$count" } },
  { $sort: { num_of_jobs_with_this_benefit: -1, _id: 1 } },
  { $limit: 5 },
]);

// Koja je prosecna ocena benefita u Londonu koji u svojim uslugama imaju benefit "rad od kuce"?
db.benefits.aggregate([
  {
    $match: {
      $and: [
        { "_id.location": "London" },
        {
          $or: [
            { "_id.comments": { $regex: "work from home" } },
            { "_id.comments": { $regex: "Work from home" } },
          ],
        },
      ],
    },
  },
  {
    $group: {
      _id: null,
      average_benefit_rating: { $avg: "$_id.benefitRating" },
    },
  },
  {
    $project: {
      _id: "Average benefit rating",
      average_rating: { $round: ["$average_benefit_rating", 2] },
    },
  },
]);
