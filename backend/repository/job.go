// Package repository
package repository

import (
	"context"
	"fmt"
	"log"

	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type JobRepository struct {
	Collection *mongo.Collection
}

func NewJobRepository(client *mongo.Client, dbName string) *JobRepository {
	return &JobRepository{
		Collection: client.Database(dbName).Collection("jobs"),
	}
}

func (r *JobRepository) Insert(job models.Job) (bson.ObjectID, error) {
	inserted, err := r.Collection.InsertOne(context.TODO(), job)
	if err != nil {
		log.Println("error inserting..", err)
		return bson.NilObjectID, err
	}

	fmt.Println("inserted new record with id: ", inserted.InsertedID)
	return inserted.InsertedID.(bson.ObjectID), nil
}

func (r *JobRepository) FindAll() ([]models.Job, error) {
	cursor, err := r.Collection.Find(context.TODO(), bson.D{})
	if err != nil {
		return nil, err
	}

	var results []models.Job
	err = cursor.All(context.TODO(), &results)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *JobRepository) FindByID(jobID string) (models.Job, error) {
	var result models.Job

	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		return models.Job{}, err
	}

	filter := bson.M{"_id": id}

	err = r.Collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		return models.Job{}, err
	}

	return result, nil
}

func (r *JobRepository) Update(jobID string, newJob models.Job) (models.Job, error) {
	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		log.Println("error parsing id: ", err)
		return models.Job{}, err
	}

	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{
		"companyName": newJob.CompanyName,
		"title":       newJob.Title,
		"description": newJob.Description,
		"languages":   newJob.Languages,
	}}

	var updatedJob models.Job

	returnOptions := options.FindOneAndUpdate().SetReturnDocument(options.After)
	err = r.Collection.FindOneAndUpdate(context.TODO(), filter, update, returnOptions).Decode(&updatedJob)
	if err != nil {
		log.Println("error updating the job: ", err)
		return models.Job{}, err
	}

	return updatedJob, nil
}

func (r *JobRepository) Delete(jobID string) error {
	id, err := bson.ObjectIDFromHex(jobID)
	if err != nil {
		return fmt.Errorf("invalid job ID: %w", err)
	}

	filter := bson.M{"_id": id}

	deleted, err := r.Collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		return err
	}

	if deleted.DeletedCount == 0 {
		return fmt.Errorf("no job found with ID %s", jobID)
	}

	fmt.Println("deleted the following record: ", deleted)

	return nil
}
