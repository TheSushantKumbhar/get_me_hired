package models

import (
	"context"
	"fmt"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// id
// job title
// job description
// languages

const jobCollectionName = "jobs"

type Job struct {
	ID          bson.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	CompanyName string        `json:"companyName" bson:"companyName"`
	Title       string        `json:"title" bson:"title"`
	Description string        `json:"description" bson:"description"`
	Languages   []string      `json:"languages" bson:"languages"`
}

func InsertOneJob(job Job) error {
	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)

	inserted, err := collection.InsertOne(context.TODO(), job)
	if err != nil {
		log.Println("error inserting..", err)
		return err
	}

	fmt.Println("inserted new record with id: ", inserted.InsertedID)
	return err
}

func InsertManyJobs(jobs []Job) error {
	newJobs := make([]any, len(jobs))

	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)

	result, err := collection.InsertMany(context.TODO(), newJobs)
	if err != nil {
		log.Println("error inserting..", err)
		return err
	}

	fmt.Println("inserted all records: ", result)
	return nil
}

func UpdateJob(jobID string, newJob Job) (Job, error) {
	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		log.Println("error parsing id: ", err)
		return Job{}, err
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{
		"companyName": newJob.CompanyName,
		"title":       newJob.Title,
		"description": newJob.Description,
		"languages":   newJob.Languages,
	}}

	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)

	var updatedJob Job

	returnOptions := options.FindOneAndUpdate().SetReturnDocument(options.After)
	err = collection.FindOneAndUpdate(context.TODO(), filter, update, returnOptions).Decode(&updatedJob)
	if err != nil {
		log.Println("error updating the job: ", err)
		return Job{}, err
	}

	return updatedJob, nil
}

func DeleteJob(jobID string) error {
	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": id}

	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)
	deleted, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		return err
	}

	fmt.Println("delelted the following record: ", deleted)

	return nil
}

func FindJobByID(jobID string) (Job, error) {
	var result Job

	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		return Job{}, err
	}

	filter := bson.M{"_id": id}

	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)
	err = collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		return Job{}, err
	}

	return result, nil
}

func FindJobByTitle(jobTitle string) Job {
	var result Job

	filter := bson.D{{Key: "title", Value: jobTitle}}

	collection := MongoClient.Database(os.Getenv("MONGODB_NAME")).Collection(jobCollectionName)
	err := collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		log.Fatalln("error finding Job: ", err)
	}

	return result
}
