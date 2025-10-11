package repository

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/TheSushantKumbhar/get_me_hired/backend/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type UserRepository struct {
	Collection *mongo.Collection
}

func NewUserRepository(client *mongo.Client, dbName string) *UserRepository {
	collection := client.Database(dbName).Collection("users")

	if err := CreateUserIndexes(collection); err != nil {
		log.Fatalln("could not create user indexes", err)
	}

	return &UserRepository{Collection: collection}
}

func CreateUserIndexes(collection *mongo.Collection) error {
	// creating unique indexes for username and email
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	usernameIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	emailIndex := mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	}

	_, err := collection.Indexes().CreateMany(ctx, []mongo.IndexModel{usernameIndex, emailIndex})
	if err != nil {
		return err
	}

	return nil
}

func (r *UserRepository) Insert(user models.User) (bson.ObjectID, error) {
	inserted, err := r.Collection.InsertOne(context.TODO(), user)
	if err != nil {
		log.Println("error inserting....", err)
		return bson.NilObjectID, err
	}

	fmt.Println("inserted new user in DB with id: ", inserted.InsertedID)

	return inserted.InsertedID.(bson.ObjectID), nil
}

func (r *UserRepository) FindByUsername(username string) (models.User, error) {
	var result models.User

	filter := bson.M{"username": username}
	err := r.Collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		return models.User{}, err
	}

	return result, nil
}

func (r *UserRepository) FindByID(id string) (models.User, error) {
	userID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return models.User{}, err
	}

	var result models.User
	filter := bson.M{"_id": userID}
	err = r.Collection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		return models.User{}, err
	}

	return result, nil
}
