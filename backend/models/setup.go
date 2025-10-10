// Package models
package models

import (
	"os"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var MongoClient *mongo.Client

func ConnectDatabase() {
	clientOption := options.Client().ApplyURI(os.Getenv("MONGODB_URI"))
	client, err := mongo.Connect(clientOption)
	if err != nil {
		panic(err)
	}

	MongoClient = client
}
