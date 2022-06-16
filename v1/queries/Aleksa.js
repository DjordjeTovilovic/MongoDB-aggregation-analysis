// Koja je prosecna ocena benefita u Londonu koji u svojim uslugama imaju benefit "rad od kuce"?
db.glassdoor.aggregate([
    {$match: {$and: [{"location" : "London"}, {$or : [{"benefits.comment" : {$regex : "work from home"}} ,{"benefits.comment" : {$regex : "Work from home"}}]}  ]}},
    {$group: {"_id" : null,"average_benefit_rating" : {$avg : "$benefitRating"}}},
    {$project: {_id: "Average benefit rating" ,average_rating: {$round: ["$average_benefit_rating", 2]}}}
])

//Koja je najcesce rangirana industrija u Londonu?
db.glassdoor.aggregate([
    {$match: {"location" : "London"}},
    {$group: {_id: { industry: "$industry" , industryId: "$industryId", numberOfRatings: "$nubmerOfRatings"}}},
    {$project: {industry : "$_id.industry" , number: "$_id.numberOfRatings" , location: "$location"}},
    {$match: {"number" : {$gt : 0}}},
    {$sort: {"number" : -1}},
    {$project: {most_rated_industry : "$industry"}},
    {$limit: 1}
]);

// Koji je najcesci emp u Srbiji koji je ocenjen bar jednom, a radi za posao Softverskog inzinjera ili front end developera?
db.glassdoor.aggregate([
    {$match : {"country" : "Serbia"}}, 
    {$match : { $or : [{"jobTitle" : {$regex : "Software"}}, {"jobTitle" : {$regex : "software"}} , {"jobTitle" : {$regex : "front"}} , {"jobTitle" : {$regex : "Front"}}]}},
    {$group : {_id: {name : "$empName" , empId : "$empId" , empSize : "$empSize"} , "num" : {$sum : "$nubmerOfRatings"}}},
    {$project: {emp : "$_id.name" , num : "$num"}},
    {$match: {num : {$gt : 0}}},
    {$sort : {"num" : -1}},
    {$limit: 1},
    {$project: {emp : "$_id.name" , num : "$num"}},
]);

//Izlistaj koji poslovi imaju benefit sportskih usluga, kao i koliko ih ima?
db.glassdoor.aggregate([
    {$match : { $or :[ {"benefits.comment":{$regex: "Sport"}},{"benefits.comment":{$regex : "sport"}},{"benefits.comment":{$regex: "sports"}} ,{"benefits.comment":{$regex: "Sports"}} ]}},
    {$project: {jobTitle : "$jobTitle"}},
    {$group: {_id : "$jobTitle" , count : {$sum : 1}}},
    {$project: {jobTitle : "$_id" , num_of_jobs_with_this_benefit : "$count"}},
    {$sort : {num_of_jobs_with_this_benefit : -1 , _id: 1}},
    {$limit : 5}
])

// Koji su top 5 industrija u kojima Softverski inzinjeri zaradjuju navise para?
db.glassdoor.aggregate([
    {$unwind: "$salaries"},
    {$match: {jobTitle : "Software Engineer"}},
    {$group: {_id: {industry : "$industry" , industryId: "$industryId"} , "average" : {$avg : "$salaries.payPercentile90"}}},
    {$project: {industry : "$_id.industry" , average_salary: {$round : ["$average" , 2]}}},
    {$sort: {"average_salary" : -1}},
    {$limit : 5}
])