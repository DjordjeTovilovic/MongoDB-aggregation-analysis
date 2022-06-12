from dateutil import parser
import pymongo
import csv

class JobsParser:
    def __init__(self, file):
        self._file = file
        self.reviews = {}
        self.benefits = {}
        self.salaries = {}
        self.initialize()


    def read_reviews_from_csv(self):
        file = 'glassdoor/glassdoor_reviews.csv'
        with open(file, 'r', encoding = 'cp850') as csv_file:
            reader = csv.DictReader( (line.replace('\0','') for line in csv_file) )
            for row in reader:
                if row['reviews.val.reviewRatings.overall'] != '':
                    if row['id'] not in self.reviews:
                        self.reviews[row['id']] = [self.get_reviews(row)]
                    else:
                        self.reviews[row['id']].append(self.get_reviews(row))
    

    def read_benefits_from_csv(self):
        file = 'glassdoor/glassdoor_benefits_comments.csv'
        with open(file, 'r', encoding = 'cp850') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if row['benefits.comments.val.rating'] != '':
                    if row['id'] not in self.benefits:
                        self.benefits[row['id']] = [self.get_benefits(row)]
                    else:
                        self.benefits[row['id']].append(self.get_benefits(row))

    def read_salaries_from_csv(self):
        file = 'glassdoor/glassdoor_salary_salaries.csv'
        with open(file, 'r', encoding = 'cp850') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if row['salary.salaries.val.salaryPercentileMap.payPercentile10'] != '':
                    if row['id'] not in self.salaries:
                        self.salaries[row['id']] = [self.get_salaries(row)]
                    else:
                        self.salaries[row['id']].append(self.get_salaries(row))


    def initialize(self):
        self.read_reviews_from_csv()
        self.read_benefits_from_csv()
        self.read_salaries_from_csv()


    def add_jobs_to_db(self, url, db_name):
        client = pymongo.MongoClient(url)
        db = client[db_name]
        db['glassdoor'].delete_many({})
        jobs = []
        with open(self._file, 'r', encoding = 'cp850') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                job = self.get_job(row)
                try:
                    job['benefits'] = self.benefits[row['benefits.comments']]
                except:
                    pass
                try:
                    job['reviews'] = self.reviews[row['reviews']]
                except:
                    pass
                try:
                    job['salaries'] = self.salaries[row['salary.salaries']]
                except:
                    pass
                jobs.append(job)
    
        db['glassdoor'].insert_many(jobs)


    def get_job(self, row) -> dict:
        return {
            '_id': row['gaTrackerData.pageRequestGuid.guid'],
            'empId': int(row['gaTrackerData.empId']),
            'empName': row['gaTrackerData.empName'],
            'industryId': int(row['gaTrackerData.industryId']),
            'industry': row['gaTrackerData.industry'],
            'jobId': row['gaTrackerData.jobId.long'],
            'jobTitle': row['gaTrackerData.jobTitle'],
            'location': row['gaTrackerData.location'],
            'country': row['map.country'],
            'benefitRating': float(row['benefits.benefitRatingDecimal']),
            'nubmerOfRatings': int(row['benefits.numRatings']),
        }

    def get_reviews(self, row) -> dict:
        return {
            '_id': row['reviews.val.id'],
            'overallRating': row['reviews.val.reviewRatings.overall'],
            'compBenefitsRating': row['reviews.val.reviewRatings.compBenefits'],
            'cultureValuesRating': row['reviews.val.reviewRatings.cultureValues'],
            'seniorManagmentRating': row['reviews.val.reviewRatings.seniorManagement'],
            'workLifeBalanceRating': row['reviews.val.reviewRatings.worklifeBalance'],
            'jobTitle': row['reviews.val.reviewerJobTitle'],
        }

    def get_benefits(self, row) -> dict:
        return {
            'currentJob': bool(row['benefits.comments.val.currentJob']),
            'rating': float(row['benefits.comments.val.rating']),
            'jobTitle': row['benefits.comments.val.jobTitle'],
            'state': row['benefits.comments.val.state'],
            'city': row['benefits.comments.val.city'],
        }

    def get_salaries(self, row) -> dict:
        d = {
            'jobTitle': row['salary.salaries.val.jobTitle'],
            'payCount': row['salary.salaries.val.basePayCount'],
            'payPercentile10': float(row['salary.salaries.val.salaryPercentileMap.payPercentile10']),
            'payPercentile90': float(row['salary.salaries.val.salaryPercentileMap.payPercentile90']),
        }

        if (row['salary.salaries.val.payPeriod'] == 'MONTHLY'):
            d['payPercentile90'] *= 12
            d['payPercentile10'] *= 12
        elif (row['salary.salaries.val.payPeriod'] == 'HOURLY'):
            d['payPercentile90'] *= 2080
            d['payPercentile10'] *= 2080

        return d


if __name__ == '__main__':
    job_parser = JobsParser('glassdoor/glassdoor.csv')
    job_parser.add_jobs_to_db(url = 'mongodb://localhost:27017/', db_name = 'sbp-v1')